import { NextResponse } from 'next/server';
import { courseRepository } from '@/lib/models/courseRepository';

export async function GET() {
  try {
    const courses = await courseRepository.findMany();
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, category, chapters, duration, level, syllabus } = body;

    // Validate input
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create course
    const course = await courseRepository.create({
      data: {
        title,
        description,
        imageUrl,
        category: category || 'Computer Science',
        chapters: chapters || 1,
        duration: duration || '10 hours',
        level: level || 'Beginner',
        syllabus: syllabus || null,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 