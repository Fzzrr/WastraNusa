import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const pathName = request.nextUrl.pathname;

  const authRoutes = ['/login', '/register'];
  // TODO: add path on protected route for user's page when we have it
  const protectedRoutes = ['/admin', '/seller', '/profile', '/cart'];

  const isAuthRoute = authRoutes.some((route) => pathName.startsWith(route));

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathName.startsWith(route),
  );

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionCookie && isAuthRoute) {
    if (
      pathName.startsWith('/login') &&
      request.nextUrl.searchParams.get('session_expired') === 'true'
    ) {
      const response = NextResponse.next();

      const cookieOptions = {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax' as const,
      };

      const prefix = isProd ? '__Secure-' : '';

      response.cookies.set(
        `${prefix}better-auth.session_token`,
        '',
        cookieOptions,
      );
      response.cookies.set(
        `${prefix}better-auth.session_data`,
        '',
        cookieOptions,
      );

      return response;
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/login',
    '/register',
    '/profile/:path*',
    '/cart/:path*',
  ],
};
