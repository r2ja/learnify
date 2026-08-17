const { Pool } = require('pg');

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetDatabase() {
  let client = null;
  
  try {
    console.log('Resetting database...');
    client = await pool.connect();
    
    // Start transaction
    await client.query('BEGIN');

    // Delete data from all tables in the correct order (respecting foreign key constraints)
    await client.query('DELETE FROM "Message"');
    await client.query('DELETE FROM "Chat"');
    await client.query('DELETE FROM "_AssessmentToUser"');
    await client.query('DELETE FROM "Assessment"');
    await client.query('DELETE FROM "_CourseToUser"');
    await client.query('DELETE FROM "Course"');
    await client.query('DELETE FROM "LearningProfile"');
    await client.query('DELETE FROM "User"');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database reset successfully!');
  } catch (error) {
    // Rollback transaction on error
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    
    // Close pool
    await pool.end();
  }
}

resetDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 