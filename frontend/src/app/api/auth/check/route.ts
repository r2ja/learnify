import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    // Get the cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Get the auth token
    const token = cookies['auth_token'];
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No auth token found'
      }, { status: 200 });
    }

    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Invalid token'
      }, { status: 200 });
    }

    // Return authentication information
    return NextResponse.json({ 
      authenticated: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      },
      message: 'Valid token found'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      message: 'Error checking authentication',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
} 