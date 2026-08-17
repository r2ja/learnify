import jwt from 'jsonwebtoken';
import { type NextRequest } from 'next/server';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { type GetServerSidePropsContext } from 'next';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days
const COOKIE_NAME = 'auth_token';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Create a JWT token
export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify a JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Set JWT token in cookies (client-side)
export function setTokenCookie(token: string, context?: any) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'strict',
    ...(context ? { req: context.req, res: context.res } : {}),
  });
}

// Get JWT token from cookies (client-side)
export function getTokenFromCookies(context?: any): string | undefined {
  return getCookie(COOKIE_NAME, context ? { req: context.req, res: context.res } : undefined) as string | undefined;
}

// Get JWT token from cookies in middleware
export function getTokenFromRequestCookies(req: NextRequest) {
  return req.cookies.get(COOKIE_NAME)?.value;
}

// Remove JWT token cookie (client-side)
export function removeTokenCookie(context?: any) {
  deleteCookie(COOKIE_NAME, context ? { req: context.req, res: context.res } : undefined);
}

// Get user from token
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  // You may want to fetch more user data from the database here
  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
} 