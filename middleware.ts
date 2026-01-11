// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Protect dashboard routes (everything else)
  const session = req.cookies.get('session')?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname); // optional: redirect back after login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to all routes except Next internals/static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
