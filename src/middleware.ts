import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // 1. Define Public Routes (Always accessible)
    // 1. Define Public Routes (Always accessible)
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/share/');

    // 2. Decrypt Session
    const cookie = (await cookies()).get('session')?.value;
    let session = null;
    if (cookie) {
        try {
            session = await decrypt(cookie);
        } catch (e) {
            // invalid token
        }
    }

    // 3. Logic:
    // If user is ON a public route (login/register) AND is logged in -> Redirect to Home
    if (isPublicRoute && session?.userId) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // If user is NOT on a public route AND is NOT logged in -> Redirect to Login
    if (!isPublicRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // Otherwise, allow
    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
