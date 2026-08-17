import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { userRepository } from '@/lib/models/userRepository';

export async function GET(request: Request) {
  try {
    // Get the token from cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const authToken = getCookieValue(cookieHeader, 'auth_token');

    console.log('GET /api/auth/me - Cookie header present:', !!cookieHeader);
    console.log('GET /api/auth/me - Auth token present:', !!authToken);

    if (!authToken) {
      console.log('GET /api/auth/me - No auth token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = verifyToken(authToken);
    console.log('GET /api/auth/me - Token verification result:', !!payload);

    if (!payload) {
      console.log('GET /api/auth/me - Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('GET /api/auth/me - User ID from token:', payload.userId);

    // Get the user from database
    const user = await userRepository.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('GET /api/auth/me - User found in database:', !!user);

    if (!user) {
      console.log('GET /api/auth/me - User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('GET /api/auth/me - Returning user data:', JSON.stringify(user));
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error in auth/me route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to parse cookies from header
function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});
  
  return cookies[name];
} 