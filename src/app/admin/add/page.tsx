import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import EquipmentForm from '@/components/admin/EquipmentForm';
import { createEquipment } from '@/app/actions';

export default async function AdminAddPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return <EquipmentForm action={createEquipment} />;
}
