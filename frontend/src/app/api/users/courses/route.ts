import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // For development/demo purposes, we'll just return all courses
    // In a real app, you would authenticate the user and return only their courses
    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: true,
        chapters: true,
        duration: true,
        level: true,
        syllabus: true,
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 