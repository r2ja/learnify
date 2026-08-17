import { v4 as uuidv4 } from 'uuid';
import { query, transaction, pool, formatQuery } from '../db';
import { 
  Course, 
  CourseCreateInput, 
  CourseUpdateInput, 
  CourseWithRelations,
  User,
  Assessment
} from './types';

export const courseRepository = {
  /**
   * Find all courses with optional filtering
   */
  async findMany({ select, take, skip }: { 
    select?: Record<string, boolean>, 
    take?: number, 
    skip?: number 
  } = {}): Promise<Course[]> {
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
      FROM "Course"
      ${limitClause}
      ${offsetClause}
    `;
    
    return await query<Course>(sql);
  },

  /**
   * Find a course by its unique ID
   */
  async findUnique({ 
    where, 
    select, 
    include 
  }: { 
    where: { id: string }, 
    select?: Record<string, boolean>,
    include?: { students?: boolean, assessments?: boolean }
  }): Promise<CourseWithRelations | null> {
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
    
    const sql = `
      SELECT ${fields}
      FROM "Course"
      WHERE "id" = $1
    `;
    
    const courses = await query<Course>(sql, [where.id]);
    
    if (courses.length === 0) {
      return null;
    }
    
    const course = courses[0] as CourseWithRelations;
    
    // Fetch related data if requested
    if (include) {
      // Fetch enrolled students
      if (include.students) {
        const studentsSql = `
          SELECT u.*
          FROM "User" u
          JOIN "_CourseToUser" cu ON u.id = cu."A"
          WHERE cu."B" = $1
        `;
        
        const students = await query<User>(studentsSql, [course.id]);
        course.students = students;
      }
      
      // Fetch assessments
      if (include.assessments) {
        const assessmentsSql = `
          SELECT *
          FROM "Assessment"
          WHERE "courseId" = $1
        `;
        
        const assessments = await query<Assessment>(assessmentsSql, [course.id]);
        course.assessments = assessments;
      }
    }
    
    return course;
  },

  /**
   * Create a new course
   */
  async create({ 
    data 
  }: { 
    data: CourseCreateInput 
  }): Promise<Course> {
    const id = uuidv4();
    const now = new Date();
    
    // Handle syllabus JSON conversion
    let dataToInsert = { ...data };
    if (dataToInsert.syllabus && typeof dataToInsert.syllabus === 'object') {
      dataToInsert.syllabus = JSON.stringify(dataToInsert.syllabus);
    }
    
    const fields = Object.keys(dataToInsert) as Array<keyof CourseCreateInput>;
    const placeholders = fields.map((_, i) => `$${i + 4}`);
    const values = fields.map(field => dataToInsert[field]);
    
    const sql = `
      INSERT INTO "Course" (
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
    
    const courses = await query<Course>(sql, [id, now, now, ...values]);
    return courses[0];
  },

  /**
   * Update an existing course
   */
  async update({ 
    where, 
    data 
  }: { 
    where: { id: string }, 
    data: CourseUpdateInput 
  }): Promise<Course> {
    const { id } = where;
    let updateData = { ...data, updatedAt: new Date() };
    
    // Handle syllabus JSON conversion
    if (updateData.syllabus && typeof updateData.syllabus === 'object') {
      updateData.syllabus = JSON.stringify(updateData.syllabus);
    }
    
    const fields = Object.keys(updateData) as Array<keyof typeof updateData>;
    const setClauses = fields.map((field, i) => `"${field}" = $${i + 2}`);
    const values = fields.map(field => updateData[field]);
    
    const sql = `
      UPDATE "Course"
      SET ${setClauses.join(', ')}
      WHERE "id" = $1
      RETURNING *
    `;
    
    const courses = await query<Course>(sql, [id, ...values]);
    
    if (courses.length === 0) {
      throw new Error(`Course with id ${id} not found`);
    }
    
    return courses[0];
  },

  /**
   * Delete a course
   */
  async delete({ 
    where 
  }: { 
    where: { id: string } 
  }): Promise<Course> {
    return await transaction(async (client) => {
      const { id } = where;
      
      // First, delete related junction table records
      await client.query('DELETE FROM "_CourseToUser" WHERE "B" = $1', [id]);
      
      // Then delete related assessments
      await client.query('DELETE FROM "Assessment" WHERE "courseId" = $1', [id]);
      
      // Finally delete the course
      const result = await client.query('DELETE FROM "Course" WHERE "id" = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Course with id ${id} not found`);
      }
      
      return result.rows[0];
    });
  },
  
  /**
   * Enroll a user in a course
   */
  async enroll({ 
    courseId, 
    userId 
  }: { 
    courseId: string, 
    userId: string 
  }): Promise<void> {
    const sql = `
      INSERT INTO "_CourseToUser" ("A", "B")
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;
    
    await query(sql, [userId, courseId]);
  },
  
  /**
   * Unenroll a user from a course
   */
  async unenroll({ 
    courseId, 
    userId 
  }: { 
    courseId: string, 
    userId: string 
  }): Promise<void> {
    const sql = `
      DELETE FROM "_CourseToUser"
      WHERE "A" = $1 AND "B" = $2
    `;
    
    await query(sql, [userId, courseId]);
  }
}; 