import { NextResponse } from 'next/server';
import { courseRepository } from '@/lib/models/courseRepository';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const course = await courseRepository.findUnique({
      where: {
        id: courseId,
      },
      include: {
        assessments: true,
        students: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json();
    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const updatedCourse = await courseRepository.update({
      where: {
        id: courseId,
      },
      data: body,
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    await courseRepository.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 