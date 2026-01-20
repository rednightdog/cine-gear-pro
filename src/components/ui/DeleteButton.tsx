'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteEquipment } from '@/app/actions';

export function DeleteButton({ id }: { id: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        const res = await deleteEquipment(id);
        if (res.success) {
            alert('Item deleted.');
            router.push('/inventory');
            router.refresh();
        } else {
            alert('Error deleting item: ' + res.message);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-white transition-colors border border-destructive/50"
        >
            <Trash2 className="h-4 w-4" />
            Delete
        </button>
    );
}
