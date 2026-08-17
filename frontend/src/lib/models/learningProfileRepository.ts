import { v4 as uuidv4 } from 'uuid';
import { query, transaction, pool, formatQuery } from '../db';
import { 
  LearningProfile, 
  LearningProfileCreateInput, 
  LearningProfileUpdateInput, 
  LearningProfileWithRelations
} from './types';

export const learningProfileRepository = {
  /**
   * Find a learning profile by user ID
   */
  async findUnique({ 
    where 
  }: { 
    where: { id?: string, userId?: string } 
  }): Promise<LearningProfile | null> {
    if (!where.id && !where.userId) {
      throw new Error('Either id or userId must be provided');
    }
    
    let whereClause = '';
    let params = [];
    
    if (where.id) {
      whereClause = 'WHERE "id" = $1';
      params.push(where.id);
    } else {
      whereClause = 'WHERE "userId" = $1';
      params.push(where.userId);
    }
    
    const sql = `
      SELECT *
      FROM "LearningProfile"
      ${whereClause}
      LIMIT 1
    `;
    
    console.log('LearningProfileRepository.findUnique SQL:', sql, 'Params:', params);
    const profiles = await query<LearningProfile>(sql, params);
    
    // Log the result for debugging
    console.log(`LearningProfileRepository.findUnique - Found ${profiles.length} profiles for userId:`, where.userId || 'N/A');
    
    return profiles.length > 0 ? profiles[0] : null;
  },

  /**
   * Create a new learning profile
   */
  async create({ 
    data 
  }: { 
    data: LearningProfileCreateInput 
  }): Promise<LearningProfile> {
    const id = uuidv4();
    const now = new Date();
    
    // Handle preferences JSON conversion
    let dataToInsert = { ...data };
    if (dataToInsert.preferences && typeof dataToInsert.preferences === 'object') {
      dataToInsert.preferences = JSON.stringify(dataToInsert.preferences);
    }
    
    const fields = Object.keys(dataToInsert) as Array<keyof LearningProfileCreateInput>;
    const placeholders = fields.map((_, i) => `$${i + 4}`);
    const values = fields.map(field => dataToInsert[field]);
    
    const sql = `
      INSERT INTO "LearningProfile" (
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
    
    console.log('LearningProfileRepository.create SQL (values omitted for brevity)');
    const profiles = await query<LearningProfile>(sql, [id, now, now, ...values]);
    console.log('LearningProfileRepository.create - Profile created with ID:', profiles[0]?.id);
    return profiles[0];
  },

  /**
   * Update an existing learning profile
   */
  async update({ 
    where, 
    data 
  }: { 
    where: { id?: string, userId?: string }, 
    data: LearningProfileUpdateInput 
  }): Promise<LearningProfile> {
    if (!where.id && !where.userId) {
      throw new Error('Either id or userId must be provided');
    }
    
    let updateData = { ...data, updatedAt: new Date() };
    
    // Handle preferences JSON conversion
    if (updateData.preferences && typeof updateData.preferences === 'object') {
      updateData.preferences = JSON.stringify(updateData.preferences);
    }
    
    const fields = Object.keys(updateData) as Array<keyof typeof updateData>;
    const setClauses = fields.map((field, i) => `"${field}" = $${i + 2}`);
    const values = fields.map(field => updateData[field]);
    
    let whereField = where.id ? 'id' : 'userId';
    let whereValue = where.id || where.userId;
    
    const sql = `
      UPDATE "LearningProfile"
      SET ${setClauses.join(', ')}
      WHERE "${whereField}" = $1
      RETURNING *
    `;
    
    console.log(`LearningProfileRepository.update SQL for ${whereField}:`, whereValue);
    const profiles = await query<LearningProfile>(sql, [whereValue, ...values]);
    
    console.log(`LearningProfileRepository.update - ${profiles.length} profiles updated`);
    
    if (profiles.length === 0) {
      throw new Error(`Learning profile not found`);
    }
    
    return profiles[0];
  },

  /**
   * Upsert a learning profile (create or update)
   */
  async upsert({ 
    where, 
    create, 
    update 
  }: { 
    where: { userId: string }, 
    create: LearningProfileCreateInput, 
    update: LearningProfileUpdateInput 
  }): Promise<LearningProfile> {
    console.log('LearningProfileRepository.upsert - Checking if profile exists for userId:', where.userId);
    const existingProfile = await this.findUnique({ where });
    
    if (existingProfile) {
      console.log('LearningProfileRepository.upsert - Updating existing profile for userId:', where.userId);
      return await this.update({ where, data: update });
    } else {
      console.log('LearningProfileRepository.upsert - Creating new profile for userId:', where.userId);
      return await this.create({ data: create });
    }
  },

  /**
   * Delete a learning profile
   */
  async delete({ 
    where 
  }: { 
    where: { id?: string, userId?: string } 
  }): Promise<LearningProfile> {
    if (!where.id && !where.userId) {
      throw new Error('Either id or userId must be provided');
    }
    
    let whereField = where.id ? 'id' : 'userId';
    let whereValue = where.id || where.userId;
    
    const sql = `
      DELETE FROM "LearningProfile"
      WHERE "${whereField}" = $1
      RETURNING *
    `;
    
    console.log(`LearningProfileRepository.delete - Deleting profile with ${whereField}:`, whereValue);
    const profiles = await query<LearningProfile>(sql, [whereValue]);
    
    if (profiles.length === 0) {
      throw new Error(`Learning profile not found`);
    }
    
    return profiles[0];
  }
}; 