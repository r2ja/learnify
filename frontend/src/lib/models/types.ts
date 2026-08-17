// Enum for user roles
export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

// Base interfaces for entities
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User entity
export interface User extends BaseEntity {
  name: string | null;
  email: string;
  password: string | null;
  image: string | null;
  role: UserRole;
}

// Learning profile entity
export interface LearningProfile extends BaseEntity {
  userId: string;
  processingStyle: string;
  perceptionStyle: string;
  inputStyle: string;
  understandingStyle: string;
  preferences: string | null; // JSON string in PostgreSQL
  assessmentDate: Date;
}

// Course entity
export interface Course extends BaseEntity {
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  chapters: number;
  duration: string;
  level: string;
  syllabus: any | null; // JSON in PostgreSQL
}

// Assessment entity
export interface Assessment extends BaseEntity {
  title: string;
  description: string | null;
  dueDate: Date | null;
  courseId: string;
}

// Chat entity
export interface Chat extends BaseEntity {
  userId: string;
}

// Message entity
export interface Message extends BaseEntity {
  content: string;
  isUser: boolean;
  chatId: string;
}

// Relationship junction tables
export interface UserCourse {
  userId: string;
  courseId: string;
}

export interface UserAssessment {
  userId: string;
  assessmentId: string;
}

// Extended types with relationships
export interface CourseWithRelations extends Course {
  students?: User[];
  assessments?: Assessment[];
}

export interface UserWithRelations extends User {
  enrolledIn?: Course[];
  assessments?: Assessment[];
  chats?: Chat[];
  learningProfile?: LearningProfile;
}

export interface AssessmentWithRelations extends Assessment {
  course?: Course;
  students?: User[];
}

export interface ChatWithRelations extends Chat {
  user?: User;
  messages?: Message[];
}

export interface MessageWithRelations extends Message {
  chat?: Chat;
}

export interface LearningProfileWithRelations extends LearningProfile {
  user?: User;
}

// Input types for creation and update
export type UserCreateInput = {
  name?: string | null;
  email: string;
  password?: string | null;
  image?: string | null;
  role?: UserRole;
};

export type UserUpdateInput = Partial<UserCreateInput>;

export type CourseCreateInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;
export type CourseUpdateInput = Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>;

export type AssessmentCreateInput = Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>;
export type AssessmentUpdateInput = Partial<Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>>;

export type ChatCreateInput = Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>;
export type ChatUpdateInput = Partial<Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>>;

export type MessageCreateInput = Omit<Message, 'id' | 'createdAt' | 'updatedAt'>;
export type MessageUpdateInput = Partial<Omit<Message, 'id' | 'createdAt' | 'updatedAt'>>;

export type LearningProfileCreateInput = Omit<LearningProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type LearningProfileUpdateInput = Partial<Omit<LearningProfile, 'id' | 'createdAt' | 'updatedAt'>>;

// Select fields types (equivalent to Prisma select)
export type UserSelect = {
  id?: boolean;
  name?: boolean;
  email?: boolean;
  password?: boolean;
  image?: boolean;
  role?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  enrolledIn?: boolean;
  assessments?: boolean;
  chats?: boolean;
  learningProfile?: boolean;
};

export type CourseSelect = {
  id?: boolean;
  title?: boolean;
  description?: boolean;
  imageUrl?: boolean;
  category?: boolean;
  chapters?: boolean;
  duration?: boolean;
  level?: boolean;
  syllabus?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  students?: boolean;
  assessments?: boolean;
}; 