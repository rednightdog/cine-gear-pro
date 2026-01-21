import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/profile', '/admin', '/builder'];
const publicRoutes = ['/login', '/register', '/', '/inventory']; // builder was protected but let's allow public access? User said "Project Management" later. Let's protect builder for now as it will save projects. Inventory is public.

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    const session = await decrypt(cookie);

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        const url = new URL('/login', req.nextUrl);
        url.searchParams.set('callbackUrl', encodeURIComponent(req.url));
        return NextResponse.redirect(url);
    }

    // 5. Redirect to /dashboard if the user is authenticated and is visiting login or register
    if (isPublicRoute && session?.userId && (path === '/login' || path === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
