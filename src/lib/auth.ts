import { getSession } from './session';
import { prisma } from './db';

export async function isAuthenticated() {
    const session = await getSession();
    return !!session?.userId;
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.userId) return null;

    // Cache this or optimize if needed
    return prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, role: true, language: true, jobTitle: true }
    });
}

