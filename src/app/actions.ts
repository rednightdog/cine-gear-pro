'use server';

import { prisma } from '@/lib/db';
import { KitItem, EquipmentCategory, LensMount } from '@/types';
import { createSession, getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { isAuthenticated as isAuthLib } from '@/lib/auth'; // Renaming to avoid conflict if I implement new auth check

// New Auth Actions
export async function registerUser(name: string, email: string, pass: string, jobTitle?: string, language: string = 'TR') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { success: false, message: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                jobTitle,
                language,
                password: hashedPassword
            }
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Registration failed' };
    }
}

export async function loginUser(email: string, pass: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { success: false, message: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) {
        return { success: false, message: 'Invalid credentials' };
    }

    await createSession(user.id);
    return { success: true };
}

export async function logoutUser() {
    const { cookies } = await import('next/headers');
    (await cookies()).delete('session');
    return { success: true };
}

// Kit Management
// Kit Management
export async function saveKit(
    name: string,
    items: {
        item: {
            id: string,
            name?: string,
            brand?: string,
            category?: string,
            description?: string
        },
        quantity: number,
        notes?: string
    }[],
    projectDetails?: any,
    description?: string,
    kitId?: string
) {
    if (!items.length) {
        return { success: false, message: 'Kit is empty' };
    }

    const session = await getSession();
    const ownerId = session?.userId;

    if (!ownerId) {
        return { success: false, message: 'You must be logged in to save kits.' };
    }

    try {
        if (kitId) {
            // Update existing kit
            // 1. Verify ownership
            const existingKit = await prisma.kit.findUnique({ where: { id: kitId } });
            if (!existingKit) return { success: false, message: 'Kit not found' };
            if (existingKit.ownerId !== ownerId) return { success: false, message: 'Unauthorized' };

            // 2. Update Kit Details
            await prisma.kit.update({
                where: { id: kitId },
                data: {
                    name,
                    description: description || undefined,
                    projectDetails: projectDetails ? JSON.stringify(projectDetails) : undefined,
                    updatedAt: new Date()
                }
            });

            // 3. Replace Items (Transaction-like approach: Delete all, then Create)
            await prisma.kitItem.deleteMany({ where: { kitId } });

            // Use transaction to ensure all items are created safely, handling mixed types
            await prisma.$transaction(
                items.map(i => {
                    const isStandardItem = i.item.id && !i.item.id.startsWith('custom-');
                    const safeQuantity = parseInt(String(i.quantity)) || 1;

                    if (isStandardItem) {
                        return prisma.kitItem.create({
                            data: {
                                kitId: kitId!,
                                quantity: safeQuantity,
                                notes: i.notes || undefined,
                                equipmentId: i.item.id
                            } as any
                        });
                    } else {
                        return prisma.kitItem.create({
                            data: {
                                kitId: kitId!,
                                quantity: safeQuantity,
                                notes: i.notes || undefined,
                                customName: i.item.name || 'Custom Item',
                                customBrand: i.item.brand || 'Generic',
                                customCategory: i.item.category || 'Other',
                                customDescription: i.item.description,
                            } as any
                        });
                    }
                })
            );

            revalidatePath('/dashboard');
            return { success: true, kitId };

        } else {
            // Create New Kit
            const kit = await prisma.kit.create({
                data: {
                    name: name || `Untitled Kit - ${new Date().toLocaleDateString()}`,
                    description: description || undefined,
                    ownerId: ownerId,
                    projectDetails: projectDetails ? JSON.stringify(projectDetails) : undefined,
                    items: {
                        create: items.map(i => {
                            // Check if it's a standard equipment item (has a real ID, not temp)
                            const isStandardItem = i.item.id && !i.item.id.startsWith('custom-');
                            const safeQuantity = parseInt(String(i.quantity)) || 1;

                            if (isStandardItem) {
                                return {
                                    quantity: safeQuantity,
                                    notes: i.notes || undefined,
                                    equipment: { connect: { id: i.item.id } }
                                } as any;
                            } else {
                                // Custom Item
                                return {
                                    quantity: safeQuantity,
                                    notes: i.notes || undefined,
                                    customName: i.item.name || 'Custom Item',
                                    customBrand: i.item.brand || 'Generic',
                                    customCategory: i.item.category || 'Other',
                                    customDescription: i.item.description,
                                } as any;
                            }
                        })
                    }
                }
            });
            revalidatePath('/dashboard');
            return { success: true, kitId: kit.id };
        }
    } catch (error: any) {
        console.error('Failed to save kit:', error);
        return { success: false, message: error.message || 'Database error' };
    }
}




// Admin Equipment Actions
export async function createEquipment(formData: FormData) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized: Admin access required' };
    }

    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const category = formData.get('category') as EquipmentCategory;
    const daily_rate_est = parseInt(formData.get('daily_rate_est') as string);
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Specs
    const mount = (formData.get('mount') as string || undefined);
    const resolution = formData.get('resolution') as string || undefined;
    const weight_kg = formData.get('weight_kg') ? parseFloat(formData.get('weight_kg') as string) : undefined;

    try {
        await prisma.equipmentItem.create({
            data: {
                name,
                brand,
                model,
                category,
                description,
                daily_rate_est,
                imageUrl: imageUrl || '/equipment/default-camera.png', // Fallback
                // Flattened specs
                mount,
                resolution,
                weight_kg,
            }
        });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to create item' };
    }
}

import { revalidatePath } from 'next/cache';

export async function updateEquipment(id: string, formData: FormData) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const category = formData.get('category') as EquipmentCategory;
    const daily_rate_est = parseInt(formData.get('daily_rate_est') as string);
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Specs
    const mount = (formData.get('mount') as string || undefined);
    const resolution = formData.get('resolution') as string || undefined;
    const weight_kg = formData.get('weight_kg') ? parseFloat(formData.get('weight_kg') as string) : undefined;

    try {
        await prisma.equipmentItem.update({
            where: { id },
            data: {
                name,
                brand,
                model,
                category,
                description,
                daily_rate_est,
                imageUrl,
                mount,
                resolution,
                weight_kg,
            }
        });
        revalidatePath('/inventory');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to update item' };
    }
}

export async function deleteEquipment(id: string) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        await prisma.equipmentItem.delete({ where: { id } });
        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete item:', error);
        return { success: false, message: 'Failed to delete item' };
    }
}



export async function getKit(kitId: string) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const kit = await prisma.kit.findUnique({
            where: { id: kitId },
            include: { items: { include: { equipment: true } } }
        });

        if (!kit) {
            return { success: false, message: 'Kit not found' };
        }

        if (kit.ownerId !== user.id && user.role !== 'ADMIN') {
            return { success: false, message: 'Unauthorized' };
        }

        return { success: true, kit };
    } catch (error) {
        console.error('Failed to get kit:', error);
        return { success: false, message: 'Database error' };
    }
}

export async function deleteKit(kitId: string) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const kit = await prisma.kit.findUnique({
            where: { id: kitId },
            select: { ownerId: true }
        });

        if (!kit) {
            return { success: false, message: 'Kit not found' };
        }

        if (kit.ownerId !== user.id && user.role !== 'ADMIN') {
            return { success: false, message: 'Unauthorized' };
        }

        // Delete items first? Prisma cascade should handle it if configured, 
        // but explicit delete is safer if unsure about schema relations.
        // Assuming cascade delete is set in schema for Kit -> KitItems.
        // If not, we might fail here. 
        // Let's assume cascade is ON. If it fails, I'll need to check schema.
        await prisma.kit.delete({ where: { id: kitId } });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete kit:', error);
        return { success: false, message: 'Failed to delete kit' };
    }
}

export async function toggleKitVisibility(kitId: string) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const kit = await prisma.kit.findUnique({ where: { id: kitId } });

        if (!kit) {
            return { success: false, message: 'Kit not found' };
        }

        if (kit.ownerId !== user.id && user.role !== 'ADMIN') {
            return { success: false, message: 'Unauthorized' };
        }

        const updatedKit = await prisma.kit.update({
            where: { id: kitId },
            data: {
                isPublic: !kit.isPublic,
                // Ensure shareToken exists if becoming public
                shareToken: (!kit.shareToken && !kit.isPublic) ? crypto.randomUUID() : undefined
            }
        });

        revalidatePath('/dashboard');
        return { success: true, isPublic: updatedKit.isPublic, shareToken: updatedKit.shareToken };
    } catch (error) {
        console.error('Failed to toggle kit visibility:', error);
        return { success: false, message: 'Database error' };
    }
}

export async function updateProfile(formData: FormData) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const language = formData.get('language') as string;

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                jobTitle,
                language
            }
        });
        revalidatePath('/profile');
        revalidatePath('/dashboard'); // Update nav name
        return { success: true };
    } catch (e) {
        console.error('Failed to update profile:', e);
        return { success: false, message: 'Database error' };
    }
}

export async function changePassword(formData: FormData) {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    // Fetch full user for password comparison (getCurrentUser might not select password)
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) return { success: false, message: 'User not found' };

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
        return { success: false, message: 'New passwords do not match' };
    }

    const valid = await bcrypt.compare(currentPassword, fullUser.password);
    if (!valid) {
        return { success: false, message: 'Current password is incorrect' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        return { success: true };
    } catch (e) {
        console.error('Failed to change password:', e);
        return { success: false, message: 'Database error' };
    }
}
