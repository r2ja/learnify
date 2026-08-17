import { v4 as uuidv4 } from 'uuid';
import { query, transaction, pool, formatQuery } from '../db';
import { 
  User, 
  UserCreateInput, 
  UserUpdateInput, 
  UserWithRelations,
  Course
} from './types';

export const userRepository = {
  /**
   * Find all users with optional filtering
   */
  async findMany({ select, take, skip }: { 
    select?: Record<string, boolean>, 
    take?: number, 
    skip?: number 
  } = {}): Promise<User[]> {
    // If select is provided, make sure each column name is properly quoted
    let fields;
    if (select) {
      fields = Object.keys(select)
        .filter(key => select[key])
        .map(key => `"${key}"`)
        .join(', ');
    } else {
      fields = '*';
    }
    
    const limitClause = take ? `LIMIT ${take}` : '';
    const offsetClause = skip ? `OFFSET ${skip}` : '';
    
    const sql = `
      SELECT ${fields}
      FROM "User"
      ${limitClause}
      ${offsetClause}
    `;
    
    console.log('UserRepository.findMany SQL:', sql);
    const users = await query<User>(sql);
    console.log(`UserRepository.findMany - Found ${users.length} users`);
    return users;
  },

  /**
   * Find a user by their unique ID
   */
  async findUnique({ 
    where, 
    select, 
    include 
  }: { 
    where: { id?: string, email?: string }, 
    select?: Record<string, boolean>,
    include?: { enrolledIn?: boolean, learningProfile?: boolean }
  }): Promise<UserWithRelations | null> {
    // If select is provided, make sure each column name is properly quoted
    let fields;
    if (select) {
      fields = Object.keys(select)
        .filter(key => select[key])
        .map(key => `"${key}"`)
        .join(', ');
    } else {
      fields = '*';
    }
    
    let whereClause = '';
    const params: any[] = [];
    
    if (where.id) {
      whereClause = 'WHERE "id" = $1';
      params.push(where.id);
    } else if (where.email) {
      whereClause = 'WHERE "email" = $1';
      params.push(where.email);
    } else {
      throw new Error('Either id or email must be provided');
    }
    
    const sql = `
      SELECT ${fields}
      FROM "User"
      ${whereClause}
    `;
    
    console.log('UserRepository.findUnique SQL:', sql, 'Params:', params);
    const users = await query<User>(sql, params);
    console.log(`UserRepository.findUnique - Found ${users.length} users for query:`, whereClause);
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0] as UserWithRelations;
    
    // Fetch related data if requested
    if (include) {
      // Fetch enrolled courses
      if (include.enrolledIn) {
        const coursesSql = `
          SELECT c.*
          FROM "Course" c
          JOIN "_CourseToUser" cu ON c."id" = cu."B"
          WHERE cu."A" = $1
        `;
        
        const courses = await query<Course>(coursesSql, [user.id]);
        user.enrolledIn = courses;
      }
      
      // Fetch learning profile
      if (include.learningProfile) {
        const profileSql = `
          SELECT *
          FROM "LearningProfile"
          WHERE "userId" = $1
        `;
        
        const profiles = await query(profileSql, [user.id]);
        if (profiles.length > 0) {
          user.learningProfile = profiles[0];
        }
      }
    }
    
    return user;
  },

  /**
   * Create a new user
   */
  async create({ 
    data 
  }: { 
    data: UserCreateInput 
  }): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const fields = Object.keys(data) as Array<keyof UserCreateInput>;
    const placeholders = fields.map((_, i) => `$${i + 4}`);
    const values = fields.map(field => data[field]);
    
    const sql = `
      INSERT INTO "User" (
        "id", 
        "createdAt", 
        "updatedAt",
        ${fields.map(f => `"${f}"`).join(', ')}
      )
      VALUES (
        $1, $2, $3, ${placeholders.join(', ')}
      )
      RETURNING *
    `;
    
    const users = await query<User>(sql, [id, now, now, ...values]);
    return users[0];
  },

  /**
   * Update an existing user
   */
  async update({ 
    where, 
    data 
  }: { 
    where: { id: string }, 
    data: UserUpdateInput 
  }): Promise<User> {
    const { id } = where;
    const updateData = { ...data, updatedAt: new Date() };
    
    const fields = Object.keys(updateData) as Array<keyof typeof updateData>;
    const setClauses = fields.map((field, i) => `"${field}" = $${i + 2}`);
    const values = fields.map(field => updateData[field]);
    
    const sql = `
      UPDATE "User"
      SET ${setClauses.join(', ')}
      WHERE "id" = $1
      RETURNING *
    `;
    
    console.log('UserRepository.update SQL:', sql, 'Params:', [id, ...values]);
    const users = await query<User>(sql, [id, ...values]);
    
    if (users.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return users[0];
  },

  /**
   * Delete a user
   */
  async delete({ 
    where 
  }: { 
    where: { id: string } 
  }): Promise<User> {
    return await transaction(async (client) => {
      const { id } = where;
      
      // First, delete related junction table records
      await client.query('DELETE FROM "_CourseToUser" WHERE "A" = $1', [id]);
      await client.query('DELETE FROM "_AssessmentToUser" WHERE "A" = $1', [id]);
      
      // Then delete the user
      const result = await client.query('DELETE FROM "User" WHERE "id" = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      
      return result.rows[0];
    });
  }
}; 