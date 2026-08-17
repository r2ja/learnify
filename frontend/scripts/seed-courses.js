const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Course data with detailed chapter information
const coursesData = [
  {
    title: "Fundamentals of Computer Programming",
    description: "A foundational course introducing the basic concepts and principles of computer programming. Students will learn problem-solving techniques, algorithmic thinking, and programming fundamentals.",
    imageUrl: "/assets/images/courses/programming.jpg",
    category: "Computer Science",
    chapters: 8,
    duration: "12 weeks",
    level: "Beginner",
    syllabus: {
      chapters: [
        {
          title: "Introduction to Computing",
          content: "This chapter provides an overview of computing, the binary system, and how computers process information. It covers the history of computing and introduces the concept of algorithms.",
          readings: ["Introduction to Algorithms by Thomas H. Cormen", "Computer Science: An Overview by J. Glenn Brookshear"],
          exercises: 5
        },
        {
          title: "Problem Solving and Algorithm Development",
          content: "Learn how to approach problems systematically, break them down into smaller parts, and develop step-by-step solutions using pseudocode and flowcharts.",
          readings: ["Think Like a Programmer by V. Anton Spraul"],
          exercises: 8
        },
        {
          title: "Programming Basics: Variables, Data Types, and Operators",
          content: "Introduction to the fundamental building blocks of programming: variables for storing data, different data types, and operators for manipulation.",
          readings: ["Programming Logic and Design by Joyce Farrell"],
          exercises: 10
        },
        {
          title: "Control Structures: Conditional Statements",
          content: "Learn how to implement decision-making in programs using if-else statements, switch cases, and logical operators.",
          readings: ["Code Complete by Steve McConnell (Chapter 15)"],
          exercises: 12
        },
        {
          title: "Control Structures: Loops and Iteration",
          content: "Master different types of loops (for, while, do-while) to repeat code blocks and process collections of data efficiently.",
          readings: ["Clean Code by Robert C. Martin (Chapter 5)"],
          exercises: 15
        },
        {
          title: "Functions and Modular Programming",
          content: "Learn to organize code into reusable functions, understand parameters, return values, and the concept of scope.",
          readings: ["Code Complete by Steve McConnell (Chapter 7)"],
          exercises: 12
        },
        {
          title: "Arrays and Basic Data Structures",
          content: "Introduction to arrays for storing collections of data, and basic operations like searching, inserting, and deleting elements.",
          readings: ["Data Structures and Algorithms in Python by Michael T. Goodrich"],
          exercises: 10
        },
        {
          title: "Introduction to Object-Oriented Programming",
          content: "A gentle introduction to object-oriented programming concepts: classes, objects, attributes, and methods.",
          readings: ["Object-Oriented Programming in Python by Michael H. Goldwasser"],
          exercises: 8
        }
      ]
    }
  },
  {
    title: "Object Oriented Programming",
    description: "A comprehensive exploration of object-oriented programming paradigms and design principles. Students will learn to design and implement software using object-oriented methodologies.",
    imageUrl: "/assets/images/courses/oop.jpg",
    category: "Computer Science",
    chapters: 7,
    duration: "10 weeks",
    level: "Intermediate",
    syllabus: {
      chapters: [
        {
          title: "Objects and Classes",
          content: "Deep dive into the core concepts of OOP: objects as instances of classes, class definitions, attributes, and methods. Learn how to model real-world entities in code.",
          readings: ["Object-Oriented Analysis and Design with Applications by Grady Booch"],
          exercises: 8
        },
        {
          title: "Encapsulation and Information Hiding",
          content: "Understand the principle of encapsulation: bundling data with methods that operate on that data, and restricting direct access to some components.",
          readings: ["Effective Java by Joshua Bloch (Chapter 4)"],
          exercises: 6
        },
        {
          title: "Inheritance and Code Reuse",
          content: "Learn how to create hierarchies of classes, inherit properties and behaviors, and override methods to customize behavior.",
          readings: ["Design Patterns: Elements of Reusable Object-Oriented Software by Gamma et al. (Chapter 1)"],
          exercises: 10
        },
        {
          title: "Polymorphism and Dynamic Binding",
          content: "Explore polymorphism: the ability to present the same interface for different underlying data types, and dynamic method dispatch.",
          readings: ["Clean Code by Robert C. Martin (Chapter 10)"],
          exercises: 12
        },
        {
          title: "Interfaces, Abstract Classes, and Multiple Inheritance",
          content: "Compare interfaces and abstract classes, understand their usage patterns, and learn about the challenges of multiple inheritance.",
          readings: ["Head First Design Patterns by Eric Freeman et al."],
          exercises: 9
        },
        {
          title: "Design Principles: SOLID",
          content: "Study the SOLID principles of object-oriented design: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.",
          readings: ["Agile Software Development, Principles, Patterns, and Practices by Robert C. Martin"],
          exercises: 7
        },
        {
          title: "Design Patterns",
          content: "Introduction to common design patterns: Creational (Factory, Singleton), Structural (Adapter, Composite), and Behavioral (Observer, Strategy).",
          readings: ["Design Patterns: Elements of Reusable Object-Oriented Software by Gamma et al."],
          exercises: 10
        }
      ]
    }
  },
  {
    title: "Technical Report Writing",
    description: "Learn how to effectively communicate technical information through well-structured reports, documentation, and presentations. Develop skills in writing clear, concise, and audience-appropriate technical documents.",
    imageUrl: "/assets/images/courses/technical-writing.jpg",
    category: "Communication",
    chapters: 6,
    duration: "8 weeks",
    level: "Beginner",
    syllabus: {
      chapters: [
        {
          title: "Fundamentals of Technical Communication",
          content: "Introduction to technical writing: purpose, audience analysis, and the differences between technical and other forms of writing.",
          readings: ["Technical Communication by Mike Markel", "Technical Writing For Dummies by Sheryl Lindsell-Roberts"],
          exercises: 5
        },
        {
          title: "Planning and Research Methods",
          content: "Learn research strategies, information gathering techniques, and how to plan documents to meet readers' needs.",
          readings: ["Research Strategies: Finding Your Way Through the Information Fog by William Badke"],
          exercises: 6
        },
        {
          title: "Document Design and Organization",
          content: "Master the principles of effective document design, page layout, typography, and visual elements. Learn strategies for organizing information logically.",
          readings: ["Document Design: A Guide for Technical Communicators by Miles A. Kimball"],
          exercises: 8
        },
        {
          title: "Technical Reports: Structure and Components",
          content: "Understand the standard sections of technical reports: executive summaries, introductions, methodologies, results, discussions, conclusions, and recommendations.",
          readings: ["Handbook of Technical Writing by Gerald J. Alred"],
          exercises: 10
        },
        {
          title: "Technical Documentation and User Guides",
          content: "Learn to create clear instructions, procedures, user manuals, and API documentation that users can easily follow.",
          readings: ["The Product is Docs by Christopher Gales et al."],
          exercises: 7
        },
        {
          title: "Technical Presentations and Data Visualization",
          content: "Develop skills for effective oral presentations of technical material, and learn principles for creating clear, compelling data visualizations.",
          readings: ["slide:ology by Nancy Duarte", "The Visual Display of Quantitative Information by Edward Tufte"],
          exercises: 9
        }
      ]
    }
  },
  {
    title: "Introduction to Calculus I",
    description: "A first course in calculus covering limits, derivatives, and applications. Develop a solid foundation in differential calculus and its applications to real-world problems.",
    imageUrl: "/assets/images/courses/calculus.jpg",
    category: "Mathematics",
    chapters: 6,
    duration: "14 weeks",
    level: "Intermediate",
    syllabus: {
      chapters: [
        {
          title: "Functions and Their Graphs",
          content: "Review of functions, domain and range, function operations, transformations, and mathematical models. Introduction to rates of change and tangent lines.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapters 1)"],
          exercises: 15
        },
        {
          title: "Limits and Continuity",
          content: "Introduction to the concept of limits, techniques for evaluating limits, continuity and its properties, and the Intermediate Value Theorem.",
          readings: ["Calculus by Michael Spivak (Chapter 5)", "Calculus: Early Transcendentals by James Stewart (Chapter 2)"],
          exercises: 20
        },
        {
          title: "Derivatives: Definition and Basic Rules",
          content: "The derivative as a rate of change and as the slope of a tangent line. Differentiation rules for polynomial, exponential, and trigonometric functions.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 3.1-3.4)"],
          exercises: 25
        },
        {
          title: "Derivatives: Product, Quotient, and Chain Rules",
          content: "Advanced differentiation techniques: the product rule, quotient rule, and chain rule. Implicit differentiation and related rates.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 3.5-3.9)"],
          exercises: 25
        },
        {
          title: "Applications of Derivatives",
          content: "Using derivatives to analyze functions: extrema, concavity, curve sketching. Applications to optimization problems, linear approximations, and differentials.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 4.1-4.5)"],
          exercises: 20
        },
        {
          title: "Derivatives in Science and Engineering",
          content: "Applications of derivatives in physics (motion, Newton's laws), economics (marginal analysis), biology (population growth), and engineering (related rates).",
          readings: ["Calculus by Gilbert Strang (Chapter 3)", "Applications of Calculus by Philip Straffin"],
          exercises: 15
        }
      ]
    }
  },
  {
    title: "Introduction to Calculus II",
    description: "A continuation of Calculus I, focusing on integration techniques, applications of integration, and an introduction to differential equations. Build on your calculus foundation to solve more complex problems.",
    imageUrl: "/assets/images/courses/calculus-2.jpg",
    category: "Mathematics",
    chapters: 7,
    duration: "14 weeks",
    level: "Intermediate",
    syllabus: {
      chapters: [
        {
          title: "Antiderivatives and Indefinite Integrals",
          content: "Introduction to antiderivatives, indefinite integrals, and basic integration rules. Applications to motion problems and differential equations.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 4.9)"],
          exercises: 20
        },
        {
          title: "Definite Integrals and the Fundamental Theorem of Calculus",
          content: "Riemann sums, definite integrals as area, properties of definite integrals, and the Fundamental Theorem of Calculus.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 5.1-5.5)"],
          exercises: 25
        },
        {
          title: "Integration Techniques",
          content: "Methods of integration: substitution, integration by parts, trigonometric integrals, trigonometric substitution, and partial fractions.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 7)"],
          exercises: 30
        },
        {
          title: "Improper Integrals",
          content: "Integration over infinite intervals and integration of functions with vertical asymptotes. Convergence and divergence of improper integrals.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 7.8)"],
          exercises: 15
        },
        {
          title: "Applications of Integration: Area and Volume",
          content: "Computing areas between curves, volumes of solids of revolution (disk and shell methods), and volumes by slicing.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 6.1-6.3)"],
          exercises: 20
        },
        {
          title: "Applications of Integration: Physics and Engineering",
          content: "Work, fluid pressure and force, centers of mass, and moments of inertia. Applications to physics problems.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 6.4-6.5)"],
          exercises: 20
        },
        {
          title: "Introduction to Differential Equations",
          content: "Basic concepts of differential equations, separable equations, growth and decay models, and direction fields.",
          readings: ["Calculus: Early Transcendentals by James Stewart (Chapter 9.1-9.3)"],
          exercises: 15
        }
      ]
    }
  }
];

async function main() {
  console.log('Start seeding courses...');
  let client = null;
  
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // First, delete existing courses to avoid duplicates
    await client.query('DELETE FROM "_AssessmentToUser"');
    await client.query('DELETE FROM "Assessment"');
    await client.query('DELETE FROM "_CourseToUser"');
    await client.query('DELETE FROM "Course"');
    console.log('Cleared existing courses');
    
    const courseIds = [];
    
    // Then insert the new courses
    for (const course of coursesData) {
      const courseId = uuidv4();
      const now = new Date();
      
      // Convert syllabus to JSON string
      const syllabus = JSON.stringify(course.syllabus);
      
      const result = await client.query(
        `INSERT INTO "Course" (
          id, title, description, "imageUrl", category, chapters, 
          duration, level, syllabus, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          courseId,
          course.title,
          course.description,
          course.imageUrl,
          course.category,
          course.chapters,
          course.duration,
          course.level,
          syllabus,
          now,
          now
        ]
      );
      
      courseIds.push(result.rows[0].id);
      console.log(`Created course with ID: ${result.rows[0].id}`);
    }
    
    // Get all student users
    const studentsResult = await client.query(
      `SELECT id FROM "User" WHERE role = 'STUDENT'`
    );
    
    if (studentsResult.rows.length > 0) {
      const studentId = studentsResult.rows[0].id;
      
      // Enroll the student in all courses
      for (const courseId of courseIds) {
        await client.query(
          `INSERT INTO "_CourseToUser" ("A", "B")
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [courseId, studentId]
        );
        console.log(`Enrolled student ${studentId} in course ${courseId}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Seeding completed successfully');
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error during seeding:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 