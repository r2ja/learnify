const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function main() {
  let client = null;
  
  try {
    console.log('Seeding database...');
    client = await pool.connect();
    
    // Start transaction
    await client.query('BEGIN');

    // Create a test admin user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const adminId = uuidv4();
    const now = new Date();
    
    const admin = await client.query(
      `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO UPDATE 
       SET name = $2
       RETURNING id, email`,
      [adminId, 'Admin User', 'admin@learnify.com', hashedPassword, 'ADMIN', now, now]
    );
    
    console.log('Created admin user:', admin.rows[0].email);

    // Create a test student user
    const studentId = uuidv4();
    
    const student = await client.query(
      `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO UPDATE 
       SET name = $2
       RETURNING id, email`,
      [studentId, 'Test Student', 'student@learnify.com', hashedPassword, 'STUDENT', now, now]
    );

    console.log('Created student user:', student.rows[0].email);
    
    // Create learning profile for student
    const learningProfileId = uuidv4();
    
    await client.query(
      `INSERT INTO "LearningProfile" (id, "userId", "processingStyle", "perceptionStyle", "inputStyle", "understandingStyle", preferences, "assessmentDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT ("userId") DO UPDATE
       SET "processingStyle" = $3, "perceptionStyle" = $4, "inputStyle" = $5, "understandingStyle" = $6, preferences = $7
       RETURNING id`,
      [learningProfileId, studentId, 'Active', 'Intuitive', 'Visual', 'Sequential', 'Visual learning with diagrams and charts', now, now, now]
    );

    // Create a test course
    const courseId = uuidv4();
    const syllabus = JSON.stringify({
      chapters: [
        {
          title: 'Introduction to ML Concepts',
          content: 'Overview of machine learning types and applications'
        },
        {
          title: 'Supervised Learning',
          content: 'Classification and regression algorithms'
        },
        {
          title: 'Unsupervised Learning',
          content: 'Clustering and dimensionality reduction'
        }
      ]
    });
    
    const course = await client.query(
      `INSERT INTO "Course" (id, title, description, "imageUrl", category, chapters, duration, level, syllabus, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title`,
      [courseId, 'Introduction to Machine Learning', 'Learn the fundamentals of machine learning algorithms and applications', 
       'https://placehold.co/600x400?text=Machine+Learning', 'Computer Science', 8, '24 hours', 'Intermediate', syllabus, now, now]
    );
    
    console.log('Created course:', course.rows[0].title);
    
    // Connect student to course
    console.log(`Connecting student (${studentId}) to course (${courseId})...`);
    await client.query(
      `INSERT INTO "_CourseToUser" ("A", "B")
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [courseId, studentId]
    );

    // Create a test assessment
    const assessmentId = uuidv4();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const assessment = await client.query(
      `INSERT INTO "Assessment" (id, title, description, "dueDate", "courseId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title`,
      [assessmentId, 'ML Fundamentals Quiz', 'Test your knowledge of basic machine learning concepts', 
       dueDate, courseId, now, now]
    );
    
    console.log('Created assessment:', assessment.rows[0].title);
    
    // Connect student to assessment
    await client.query(
      `INSERT INTO "_AssessmentToUser" ("A", "B")
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [assessmentId, studentId]
    );

    // Create a test chat with messages
    const chatId = uuidv4();
    
    const chat = await client.query(
      `INSERT INTO "Chat" (id, "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [chatId, studentId, now, now]
    );
    
    // Add messages to chat
    const message1Id = uuidv4();
    const message2Id = uuidv4();
    
    await client.query(
      `INSERT INTO "Message" (id, content, "isUser", "chatId", "createdAt")
       VALUES ($1, $2, $3, $4, $5)`,
      [message1Id, 'Hello, I need help understanding neural networks.', true, chatId, now]
    );
    
    await client.query(
      `INSERT INTO "Message" (id, content, "isUser", "chatId", "createdAt")
       VALUES ($1, $2, $3, $4, $5)`,
      [message2Id, 'Neural networks are computing systems inspired by the biological neural networks in animal brains. They consist of artificial neurons that can learn from and make decisions or predictions based on data.', 
       false, chatId, new Date(now.getTime() + 1000)]
    );
    
    console.log('Created chat with messages for user:', student.rows[0].email);

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    // Rollback transaction on error
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    
    // Close pool
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 