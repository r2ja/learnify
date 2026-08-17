# Learnify - Personalized Learning Platform

Learnify is an AI-powered personalized learning platform that adapts to your unique learning style. This application is built with Next.js, TypeScript, and Tailwind CSS, providing a modern and responsive user interface.

## Features

- **Personalized Learning**: Content tailored to your learning style and preferences
- **Learning Assessment**: Take a comprehensive learning style assessment to customize your experience
- **Course Management**: Browse, enroll in, and track your progress in various courses
- **AI Learning Assistant**: Chat with an AI learning assistant to enhance your understanding
- **Progress Tracking**: Monitor your learning journey with detailed analytics

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager
- PostgreSQL (instructions for installation included)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/learnify.git
cd learnify
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up PostgreSQL database:
```bash
# Install PostgreSQL and create a database named 'frontend_app_db'
# You can use the following commands to create the database:
createdb frontend_app_db
# Or use a GUI like pgAdmin or DBeaver
```

4. Create a `.env.local` file in the root directory with the following content:
```
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/frontend_app_db"

# API
API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Authentication (for future use)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
JWT_SECRET="generate-a-secure-random-secret-key"

# Environment
NODE_ENV="development"
```

5. Initialize the database:
```bash
# Run the database initialization script
npm run db:setup
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend-app/
├── public/           # Static assets
├── scripts/          # Setup and utility scripts
├── src/
│   ├── app/          # Next.js App Router pages
│   │   ├── api/      # API routes
│   ├── components/   # Reusable UI components
│   │   ├── assessment/  # Assessment components
│   │   ├── auth/        # Authentication components
│   │   ├── courses/     # Course-related components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── layout/      # Layout components
│   │   ├── learning/    # Learning components
│   │   └── profile/     # User profile components
│   ├── lib/          # Utility functions, hooks, and API layer
│   │   ├── models/      # Data repository layer for PostgreSQL
├── .env.local        # Environment variables (create this file locally)
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## API Structure

The API is built using Next.js API routes and follows a RESTful pattern:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/courses` - Course management
- `/api/assessments` - Assessment management
- `/api/chat` - Chat functionality

## Database Management

This project uses direct PostgreSQL connections via the `pg` package. The database structure is defined and managed through the repository patterns in `src/lib/models/`.

```bash
# Initialize the database with seed data
npm run db:setup

# Reset the database (caution: deletes all data)
npm run db:reset
```

## Data Access Layer

The application uses a custom repository pattern to interact with the PostgreSQL database:

- `src/lib/db.ts` - Database connection pool setup
- `src/lib/models/` - Repository implementations for each entity:
  - `userRepository.ts` - User data access
  - `courseRepository.ts` - Course data access
  - `learningProfileRepository.ts` - Learning profile data access
  - etc.

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **PostgreSQL**: Relational database with direct connection
- **Node-Postgres**: PostgreSQL client for Node.js
- **React**: JavaScript library for building user interfaces

## Deployment

The application can be deployed to Vercel, Netlify, or any other hosting service that supports Next.js applications.

```bash
npm run build
# or
yarn build
```

For database deployment, consider using:
- Managed PostgreSQL services (AWS RDS, Digital Ocean, Supabase)
- Update your production `.env` file with the correct database connection string

## License

This project is licensed under the MIT License - see the LICENSE file for details.
