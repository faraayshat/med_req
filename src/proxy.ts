import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return proxy(request);
}

async function hasValidSession(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;
  if (!session) {
    return false;
  }

  try {
    const verifyUrl = new URL('/api/auth/verify', request.url);
    const verifyResponse = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    return verifyResponse.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const sessionIsValid = await hasValidSession(request);

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isResults = request.nextUrl.pathname.startsWith('/results');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

  if ((isDashboard || isResults) && !sessionIsValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && sessionIsValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/results/:path*', '/login', '/signup'],
};
