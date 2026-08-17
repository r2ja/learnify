import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/check',
];

// Check if the path is public
function isPublicPath(path: string) {
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath));
}

// Check if the path is an API route
function isApiRoute(path: string) {
  return path.startsWith('/api/');
}

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // If it's a public path, allow access
  if (isPublicPath(path)) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // If there's no token, redirect to login page or return unauthorized for API routes
  if (!token) {
    if (isApiRoute(path)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Redirect to login page with callback URL
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify the token
  const payload = verifyToken(token);
  
  // If the token is invalid, redirect to login or return unauthorized
  if (!payload) {
    if (isApiRoute(path)) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Redirect to login page with callback URL
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Token is valid, allow access
  return NextResponse.next();
}

// Only run the middleware on the following paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth/* (authentication API routes)
     * 2. /_next/* (Next.js internal routes)
     * 3. /_static/* (static files)
     * 4. /_vercel/* (Vercel internal routes)
     * 5. /favicon.ico, /robots.txt, /sitemap.xml (SEO files)
     */
    '/((?!_next|_static|_vercel|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}; 