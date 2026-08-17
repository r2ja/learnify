import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/models/userRepository';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = params.id;
    console.log(`GET /api/users/${userId} - Fetching user`);

    const user = await userRepository.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      include: {
        enrolledIn: true,
      },
    });

    console.log(`GET /api/users/${userId} - User found:`, !!user);

    if (!user) {
      console.log(`GET /api/users/${userId} - User not found`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`GET /api/users/${userId} - Returning user data`);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Support both PATCH and PUT for updates
export async function PATCH(request: Request, { params }: RouteParams) {
  return handleUpdate(request, params);
}

export async function PUT(request: Request, { params }: RouteParams) {
  return handleUpdate(request, params);
}

async function handleUpdate(request: Request, params: RouteParams['params']) {
  try {
    const userId = params.id;
    console.log(`PATCH/PUT /api/users/${userId} - Updating user`);

    const body = await request.json();
    const { name, email, image } = body;

    console.log(`PATCH/PUT /api/users/${userId} - Update data:`, { name, email });

    // Build update object with only the fields we want to update
    const updateData: { name?: string; email?: string; image?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (image !== undefined) updateData.image = image;

    const user = await userRepository.update({
      where: { id: userId },
      data: updateData,
    });

    console.log(`PATCH/PUT /api/users/${userId} - User updated successfully`);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const userId = params.id;
    console.log(`DELETE /api/users/${userId} - Deleting user`);

    await userRepository.delete({
      where: { id: userId },
    });

    console.log(`DELETE /api/users/${userId} - User deleted successfully`);
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 