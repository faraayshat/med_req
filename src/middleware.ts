import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;

  // Define protected routes
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isResults = request.nextUrl.pathname.startsWith('/results');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

  // If user is not logged in and tries to access protected routes
  if ((isDashboard || isResults) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access auth pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/results/:path*', '/login', '/signup'],
};
