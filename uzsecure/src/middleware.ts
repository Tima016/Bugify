import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
    const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/public') || request.nextUrl.pathname.startsWith('/programs') || request.nextUrl.pathname.startsWith('/leaderboard');

    // If trying to access protected route without token, redirect to login
    if (!token && !isAuthPage && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access auth pages with token, redirect based on role
    if (token && isAuthPage) {
        // Let the client-side auth logic handle the redirect after checking role
        // Don't redirect to dashboard immediately - let it be handled client-side
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
