import { Pool, PoolClient } from 'pg';
import format from 'pg-format';

// Define a global type for the PostgreSQL pool
declare global {
  var pgPool: Pool | undefined;
}

// Create PostgreSQL connection pool with configuration from environment variables
const createConnectionPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 5000, // How long to wait for a connection to become available
  });
};

// Use global variable to avoid multiple pools in development
export const pool = globalThis.pgPool || createConnectionPool();

// For backwards compatibility with existing code that imports 'db'
export const db = pool;

// Only assign to the global object in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPool = pool;
}

// Initialize database connection with retry logic
const initializeDatabase = async (retries = 5) => {
  let currentTry = 0;
  
  while (currentTry < retries) {
    let client = null;
    
    try {
      client = await pool.connect();
      console.log('✅ Database connection established successfully');
      client.release();
      return;
    } catch (error) {
      currentTry++;
      console.error(`❌ Database connection attempt ${currentTry}/${retries} failed:`, error);
      
      if (currentTry >= retries) {
        console.error('❌ All database connection attempts failed');
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, currentTry), 10000);
      console.log(`Retrying connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      // Only try to release if client exists
      if (client) {
        try {
          client.release();
        } catch (e) {
          // Ignore release errors - client might already be released
        }
      }
    }
  }
};

// Initialize the database
initializeDatabase()
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });

// Helper function to execute queries with automatic client acquisition/release
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Helper function for formatting safe SQL (using pg-format)
export function formatQuery(query: string, ...values: any[]) {
  return format(query, ...values);
}

// Helper function for transactions
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} 