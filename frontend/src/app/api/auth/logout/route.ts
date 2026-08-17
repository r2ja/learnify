import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response object
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    // Clear the auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 