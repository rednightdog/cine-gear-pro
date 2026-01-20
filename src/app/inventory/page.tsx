import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { CatalogControls } from '@/components/ui/CatalogControls';
import { InventoryGrid } from '@/components/ui/InventoryGrid';

interface PageProps {
    searchParams: Promise<{
        category?: string;
        q?: string;
    }>;
}

export default async function InventoryPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const category = searchParams.category;
    const query = searchParams.q;

    // Ideally this filtering happens in the DB layer
    let equipment = await db.equipment.getAll();

    if (category && category !== 'All') {
        equipment = equipment.filter(item => item.category === category);
    }

    if (query) {
        const lowerQ = query.toLowerCase();
        equipment = equipment.filter(item =>
            item.name.toLowerCase().includes(lowerQ) ||
            item.brand.toLowerCase().includes(lowerQ) ||
            item.model.toLowerCase().includes(lowerQ)
        );
    }

    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <CatalogControls isAdmin={isAdmin} />

                {/* Grid / List View */}
                <InventoryGrid equipment={equipment} isAdmin={isAdmin} />
            </div>
        </div>
    );
}
