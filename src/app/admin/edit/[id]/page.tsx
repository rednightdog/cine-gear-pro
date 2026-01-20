import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import EquipmentForm from '@/components/admin/EquipmentForm';
import { updateEquipment } from '@/app/actions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminEditPage(props: PageProps) {
    const { id } = await props.params;
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const item = await prisma.equipmentItem.findUnique({
        where: { id },
    });

    if (!item) {
        notFound();
    }

    // Wrap the update action to bind the ID
    const updateAction = async (formData: FormData) => {
        'use server';
        return updateEquipment(id, formData);
    };

    // Flatten specs if they are nulls to undefined to match Clean typings if needed, 
    // or passing "item" directly if EquipmentForm handles it.
    // EquipmentForm expects Partial<EquipmentItem>.

    // We need to map DB fields to the form's expecting structure if it differs.
    // The form uses item.specs.mount etc inside the defaultValue logic? 
    // Let's check EquipmentForm implementation again.
    // Ah, EquipmentForm reads `defaultValue={initialData?.specs?.mount}` which assumes a nested structure
    // But my Prisma model has flattened fields `mount`, `weight_kg` etc.
    // I should probably map it correctly here before passing.

    const initialData = {
        ...item,
        specs: {
            mount: item.mount,
            weight_kg: item.weight_kg,
            resolution: item.resolution
        }
    };

    return <EquipmentForm initialData={initialData as any} action={updateAction} />;
}
