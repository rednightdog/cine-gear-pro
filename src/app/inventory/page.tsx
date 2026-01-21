import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { CatalogControls } from '@/components/ui/CatalogControls';
import { InventoryGrid } from '@/components/ui/InventoryGrid';

interface PageProps {
    searchParams: Promise<{
        category?: string;
        subcategory?: string;
        format?: string;
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

    const subcategory = searchParams.subcategory;
    if (subcategory && subcategory !== 'All') {
        equipment = equipment.filter(item => item.subcategory === subcategory);
    }

    const format = searchParams.format;
    // Only apply format filtering if we are in Lens or Camera category
    if (format && format !== 'All' && (category === 'Lens' || category === 'Camera')) {
        equipment = equipment.filter(item => {
            // If the item doesn't have coverage data, we might choose to hide it or show it.
            // For now, simple strict match if data exists.
            // Note: S35 vs FF vs LF. user might want FF/LF to be inclusive?
            // Let's keep it strict for now based on the button clicked.
            return item.specs.sensor_coverage === format ||
                (format === 'FF' && item.specs.sensor_coverage === 'LF') || // LF usually covers FF
                (format === 'LF' && item.specs.sensor_coverage === 'FF') || // FF lenses often cover LF to some extent, but let's be loose since terms are mixed
                (format === 'FF/LF' && (item.specs.sensor_coverage === 'FF' || item.specs.sensor_coverage === 'LF'));
        });
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
