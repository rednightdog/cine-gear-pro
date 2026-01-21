'use server';

import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, logout } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
        return { message: 'All fields are required' };
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { message: 'Email already registered' };
    }

    const hashedPassword = await hashPassword(password);

    // First user is ADMIN, others USER
    const count = await prisma.user.count();
    const role = count === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    await createSession(user.id);
    redirect('/');
}

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
        return { message: 'Invalid credentials' };
    }

    await createSession(user.id);
    const callbackUrl = formData.get('callbackUrl') as string;
    if (callbackUrl && callbackUrl.startsWith('/')) {
        redirect(callbackUrl);
    }
    redirect('/');
}

export async function logoutAction() {
    await logout();
    redirect('/');
}
