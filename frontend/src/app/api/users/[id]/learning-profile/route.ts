import { NextResponse } from 'next/server';
import { learningProfileRepository } from '@/lib/models/learningProfileRepository';
import { userRepository } from '@/lib/models/userRepository';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/users/[id]/learning-profile
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = params.id;
    
    console.log('GET /api/users/[id]/learning-profile - User ID:', userId);
    
    if (!userId) {
      console.error('User ID is missing in request params');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to find learning profile for userId:', userId);
    
    const learningProfile = await learningProfileRepository.findUnique({
      where: { userId },
    });

    console.log('Learning profile result:', JSON.stringify(learningProfile));

    if (!learningProfile) {
      console.log('Learning profile not found, creating default profile');
      
      // If profile doesn't exist, return a default one - this prevents 404 errors
      return NextResponse.json({ 
        id: null,
        userId: userId,
        processingStyle: 'Active',
        perceptionStyle: 'Intuitive',
        inputStyle: 'Visual',
        understandingStyle: 'Sequential',
        preferences: null,
        assessmentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }, { status: 200 });
    }

    return NextResponse.json(learningProfile, { status: 200 });
  } catch (error) {
    console.error('Error in learning profile GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/learning-profile
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await userRepository.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Upsert the learning profile (create if doesn't exist, update if it does)
    const updatedProfile = await learningProfileRepository.upsert({
      where: { userId },
      create: {
        userId,
        processingStyle: body.processingStyle || 'Active',
        perceptionStyle: body.perceptionStyle || 'Intuitive',
        inputStyle: body.inputStyle || 'Visual',
        understandingStyle: body.understandingStyle || 'Sequential',
        preferences: body.preferences || null,
        assessmentDate: new Date(),
      },
      update: {
        processingStyle: body.processingStyle,
        perceptionStyle: body.perceptionStyle,
        inputStyle: body.inputStyle,
        understandingStyle: body.understandingStyle,
        preferences: body.preferences,
        assessmentDate: new Date(),
      },
    });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('Error updating learning profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/learning-profile
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the profile exists
    const existingProfile = await learningProfileRepository.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Learning profile not found' },
        { status: 404 }
      );
    }

    // Delete the profile
    await learningProfileRepository.delete({
      where: { userId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting learning profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 