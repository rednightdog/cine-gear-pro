'use client';

import { EquipmentItem } from '@/types';
import { EquipmentCard } from './EquipmentCard';
import { LensGroupCard } from './LensGroupCard';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useKit } from '@/context/KitContext';
import { useMemo, useState } from 'react';

// Define preferred Category Order
const CATEGORY_ORDER = ['Camera', 'Lens', 'Filter', 'Support', 'Monitor', 'Lighting', 'Audio', 'Accessory', 'Other'];

export function InventoryGrid({ equipment, isAdmin }: { equipment: EquipmentItem[], isAdmin?: boolean }) {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');
    const { items: kitItems, addItem, addCustomItem } = useKit();

    // We use a simple native dialog ref approach or just ID for simplicity in this large file
    const openModal = () => {
        const modal = document.getElementById('customItemModal') as HTMLDialogElement;
        if (modal) modal.showModal();
    };

    const closeModal = () => {
        const modal = document.getElementById('customItemModal') as HTMLDialogElement;
        if (modal) modal.close();
    };

    // Group items by Category -> Brand
    const groupedItems = useMemo(() => {
        const groups = new Map<string, EquipmentItem[]>();

        // Initialize groups based on order
        CATEGORY_ORDER.forEach(cat => groups.set(cat, []));

        equipment.forEach(item => {
            let cat = item.category;

            // Merge Media, Power, and Grip into "Support" for display purposes
            if (cat === 'Media' || cat === 'Power' || cat === 'Grip') {
                cat = 'Support';
            }

            if (!groups.has(cat)) {
                // Handle unknown categories by putting them in Other
                if (!groups.has('Other')) groups.set('Other', []);
                groups.get('Other')!.push(item);
            } else {
                groups.get(cat)!.push(item);
            }
        });

        // Remove empty groups (except if explicitly selected maybe? No, just hide them)
        Array.from(groups.keys()).forEach(key => {
            if (groups.get(key)!.length === 0) {
                groups.delete(key);
            }
        });

        return groups;
    }, [equipment]);

    const getCategoryLabel = (cat: string) => {
        if (cat === 'Support') return 'Camera Support'; // Rename Support to Camera Support
        return cat;
    };

    // Helper determines if we should show category headers
    const showCategoryHeaders = groupedItems.size > 1;

    // Helper to render a brand section
    const renderBrandSection = (items: EquipmentItem[]) => {
        // Group by Brand
        const itemsByBrand = new Map<string, EquipmentItem[]>();
        items.forEach(item => {
            const brand = item.brand;
            if (!itemsByBrand.has(brand)) itemsByBrand.set(brand, []);
            itemsByBrand.get(brand)!.push(item);
        });

        const sortedBrands = Array.from(itemsByBrand.keys()).sort();

        return (
            <div className="flex flex-col gap-12">
                {sortedBrands.map(brand => {
                    const brandItems = itemsByBrand.get(brand)!;
                    brandItems.sort((a, b) => a.name.localeCompare(b.name));

                    // Group lenses
                    const lensGroups = new Map<string, EquipmentItem[]>();
                    const singles: EquipmentItem[] = [];

                    brandItems.forEach(item => {
                        if (item.category === 'Lens') {
                            const key = item.model;
                            if (!lensGroups.has(key)) lensGroups.set(key, []);
                            lensGroups.get(key)!.push(item);
                        } else {
                            singles.push(item);
                        }
                    });

                    const finalGroups: EquipmentItem[][] = [];
                    lensGroups.forEach((groupItems) => {
                        const sample = groupItems[0];
                        // Anamorphic or Prime usually implies a set/grouping
                        const isSet = sample.subcategory === 'Prime' || sample.subcategory === 'Anamorphic' || groupItems.length > 1;
                        if (isSet) {
                            finalGroups.push(groupItems);
                        } else {
                            singles.push(...groupItems);
                        }
                    });

                    singles.sort((a, b) => a.name.localeCompare(b.name));

                    return (
                        <div key={brand} className="space-y-4">
                            <div className="flex items-baseline gap-3 border-b border-black/10 pb-2">
                                <h3 className="text-2xl font-serif italic text-foreground opacity-80">{brand}</h3>
                                <span className="text-xs font-mono text-muted-foreground">{brandItems.length} items</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                {finalGroups.map((group, idx) => (
                                    <LensGroupCard key={`${brand}-group-${idx}`} items={group} />
                                ))}

                                {singles.length > 0 && (
                                    <div className="grid grid-cols-1 gap-0 divide-y divide-border/40">
                                        {singles.map((item) => (
                                            <div key={item.id} className="group flex flex-col sm:flex-row sm:items-baseline gap-4 py-3 hover:bg-muted/30 transition-colors px-3 -mx-3 rounded-sm">
                                                <Link href={`/inventory/${item.id}`} className="w-56 flex-shrink-0 cursor-pointer block">
                                                    <div className="font-medium text-base text-foreground group-hover:text-primary transition-colors">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                                        {item.category} {item.subcategory ? `• ${item.subcategory}` : ''}
                                                    </div>
                                                </Link>

                                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {item.specs.mount && <div><span className="opacity-50 mr-2">MNT</span>{item.specs.mount}</div>}
                                                    {item.specs.resolution && <div><span className="opacity-50 mr-2">RES</span>{item.specs.resolution}</div>}
                                                    {item.specs.sensor_size && <div><span className="opacity-50 mr-2">SNR</span>{item.specs.sensor_size}</div>}
                                                    {item.specs.focal_length && <div><span className="opacity-50 mr-2">FL</span>{item.specs.focal_length}</div>}
                                                    {item.specs.payload_kg && <div><span className="opacity-50 mr-2">PAYLOAD</span>{item.specs.payload_kg}kg</div>}
                                                </div>

                                                <div className="w-32 flex-shrink-0 text-right flex items-center justify-end gap-2">
                                                    {isAdmin && (
                                                        <Link href={`/admin/edit/${item.id}`} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground">
                                                            Run
                                                        </Link>
                                                    )}
                                                    <EquipmentCard item={item} viewMode="list-minimal" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="text-sm text-muted-foreground">
                    {equipment.length} items found
                </div>
                <button
                    onClick={openModal}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Custom Item
                </button>
            </div>

            {/* Custom Item Modal */}
            <dialog id="customItemModal" className="p-0 rounded-lg shadow-2xl backdrop:bg-black/50 bg-background border border-border w-full max-w-md text-foreground">
                <form method="dialog" className="p-6" onSubmit={(e) => {
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);

                    addCustomItem(
                        formData.get('name') as string,
                        (formData.get('category') as string) || 'Accessory',
                        (formData.get('brand') as string) || 'Custom',
                        formData.get('description') as string
                    );

                    form.reset();
                    closeModal();
                }}>
                    <h3 className="text-xl font-bold mb-6">Add Custom Item</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Item Name</label>
                            <input name="name" required className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. My Special Lens" autoFocus />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Brand</label>
                                <input name="brand" className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. Handheld" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Category</label>
                                <select name="category" className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                    {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description</label>
                            <textarea name="description" className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]" placeholder="Brief details about this item..."></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md text-sm hover:opacity-90 transition-opacity">Add to Kit</button>
                    </div>
                </form>
            </dialog>

            {groupedItems.size === 0 ? (
                <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-border dashed">
                    <p>No catalog items found.</p>
                    <p className="text-sm mt-2">Try adding a custom item instead.</p>
                </div>
            ) : !showCategoryHeaders ? (
                renderBrandSection(groupedItems.values().next().value || [])
            ) : (
                <div className="flex flex-col gap-20">
                    {Array.from(groupedItems.entries()).map(([category, catItems]) => (
                        <section key={category} className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-4xl font-bold uppercase tracking-tighter text-foreground/20">
                                    {getCategoryLabel(category)}
                                </h2>
                                <div className="h-px flex-1 bg-foreground/10" />
                            </div>
                            {renderBrandSection(catItems)}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

function PlusIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}
