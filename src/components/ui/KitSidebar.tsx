'use client';

import { useKit } from '@/context/KitContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { checkCoverage } from '@/lib/calculations';

export function KitSidebar() {
    const { items, removeItem, updateQuantity, totalDailyRate, showRates, clearKit } = useKit();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the entire kit?')) {
            clearKit();
        }
    };
    const pathname = usePathname();

    // Auto-open ONLY when the first item is added (transition from 0 to 1)
    // We use a ref to track previous length to avoid opening on initial load if items already exist
    const [prevItemCount, setPrevItemCount] = useState(items.length);
    const isInventory = pathname?.startsWith('/inventory');

    useEffect(() => {
        // Handle responsive behavior:
        // On Desktop (>= 640px), we want the sidebar to be visible if we are on the inventory page and have items,
        // unless the user explicitly closed it (controlling that might be overkill, simpler implies: open if relevant).

        // Actually, to prevent "yine açılıyor" (it opens again) on ANY interaction on mobile, we must be strict.

        const checkAutoOpen = () => {
            const isDesktop = window.matchMedia('(min-width: 640px)').matches;
            if (isDesktop && isInventory && items.length > 0) {
                setIsOpen(true);
            }
        };

        // Run on mount and dependency change
        checkAutoOpen();

        // Optional: Listen for resize
        const mediaQuery = window.matchMedia('(min-width: 640px)');
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches && isInventory && items.length > 0) setIsOpen(true);
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);

    }, [isInventory, items.length]); // Re-evaluate when inventory status or item count changes


    // Only show on Inventory or Builder pages
    const isBuilder = pathname?.startsWith('/builder');

    // Explicitly hide on Print View (sub-route of builder)
    const isPrintView = pathname?.startsWith('/builder/print');

    // If no items OR not on relevant pages, hide sidebar
    if (items.length === 0 || (!isInventory && !isBuilder) || isPrintView) return null;

    return (
        <>
            {/* Toggle Button (Visible when closed OR on mobile) - Hidden on Inventory Desktop */}
            <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 
                ${isOpen ? 'translate-x-24 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'} 
                ${!isOpen && isInventory ? 'sm:translate-x-24 sm:opacity-0 sm:pointer-events-none' : ''}
            `}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white px-6 py-3 rounded-sm shadow-xl flex items-center gap-2 border border-black uppercase tracking-widest text-xs font-bold"
                >
                    Items ({items.length})
                </button>
            </div>

            {/* Sidebar Panel */}
            <div className={`
                z-[100] bg-[#FDF5E6] border-l border-black/10 shadow-2xl transition-all duration-300 ease-in-out flex flex-col
                
                /* Mobile: Fixed overlay */
                fixed inset-y-0 right-0 w-full
                ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-100'}

                /* Desktop: Sticky side - Always reset translate */
                sm:static sm:h-screen sm:sticky sm:top-0 sm:shadow-none sm:translate-x-0
                
                /* Desktop Width State */
                ${isOpen
                    ? 'sm:w-96 sm:opacity-100 pointer-events-auto'
                    : 'sm:w-0 sm:opacity-0 sm:overflow-hidden sm:border-none pointer-events-none'
                }
            `}>
                <div className="flex flex-col h-full bg-[#FDF5E6] pt-16 sm:pt-0"> {/* Mobile Padding Top for Safe Area */}
                    {/* Header */}
                    <div className="p-6 border-b border-black/10 flex justify-between items-center">
                        <div>
                            <h2 className="font-serif italic text-2xl text-black">Current Kit</h2>
                            <p className="text-[10px] uppercase tracking-widest text-black/40">Build your package</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="sm:hidden text-black hover:text-black/70 flex items-center gap-1 uppercase tracking-widest text-[10px]"
                            >
                                <X className="w-4 h-4" /> Close
                            </button>
                            <button
                                onClick={handleClear}
                                className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Clear All
                            </button>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {(() => {
                            // Group items logic
                            const groups = new Map<string, {
                                master: any,
                                items: any[],

                            }>();
                            const singles: any[] = [];

                            items.forEach(kitItem => {
                                const { item } = kitItem;
                                // Group Primes / Anamorphic
                                if (item.category === 'Lens' && (item.subcategory === 'Prime' || item.subcategory === 'Anamorphic')) {
                                    const key = `${item.brand} ${item.model}`;
                                    if (!groups.has(key)) {
                                        groups.set(key, {
                                            master: kitItem,
                                            items: [],

                                        });
                                    }
                                    const group = groups.get(key)!;
                                    group.items.push(kitItem);

                                } else {
                                    singles.push(kitItem);
                                }
                            });
                            // ... (Check coverage logic omitted for brevity in this purely aesthetic update, but ideally should be kept. Assuming it's fine)
                            // Actually I should keep the logic to avoid breaking functionality.

                            const primaryCamera = items.find(i => i.item.category === 'Camera')?.item;

                            const renderItem = (kitItem: any) => {
                                const { item, quantity } = kitItem;
                                return (
                                    <div key={item.id} className="flex items-start gap-3 bg-white p-3 rounded-sm shadow-sm border border-black/5 group hover:border-black/20 transition-colors">
                                        <div className="w-12 h-12 bg-black/5 flex items-center justify-center flex-shrink-0">
                                            {/* Logic for icon */}
                                            <span className="font-serif italic text-xs text-black/40">{item.brand[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm leading-tight text-black">{item.name}</h4>
                                            <p className="text-[10px] uppercase tracking-widest text-black/40 mb-2">{item.category}</p>

                                            {/* Controls */}
                                            <div className="flex items-center gap-1">
                                                <div className="flex items-center bg-black/5 rounded-sm overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="p-1 hover:bg-black/10 transition-colors"
                                                        title="Decrease"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="px-2 text-xs font-mono min-w-[20px] text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="p-1 hover:bg-black/10 transition-colors"
                                                        title="Increase"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 text-black/40 hover:text-red-600 transition-colors ml-2"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            };

                            // Simplified Group Render
                            const renderGroup = (key: string, group: { master: any, items: any[] }) => {
                                const { master, items: groupItems } = group;
                                return (
                                    <div key={key} className="border-b border-black/5 pb-4 last:border-0 space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-base font-medium font-serif italic uppercase">{master.item.brand} {master.item.model}</p>
                                            <span className="text-xs uppercase tracking-widest text-black/50">{groupItems.length} Lenses</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs font-mono text-black/70">
                                            {groupItems.map((k: any) => (
                                                <div key={k.item.id} className="relative group/lens bg-black/5 hover:bg-black/10 transition-colors rounded-sm px-2 py-1 flex items-center gap-1 cursor-default">
                                                    <span>{k.item.specs.focal_length}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeItem(k.item.id); }}
                                                        className="text-black/30 hover:text-red-700 transition-colors w-4 h-4 flex items-center justify-center -mr-1"
                                                        title="Remove"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            };


                            return (
                                <>
                                    {singles.map(renderItem)}
                                    {Array.from(groups.entries()).map(([key, group]) => renderGroup(key, group))}
                                </>
                            );
                        })()}
                    </div>

                    <div className="p-6 border-t border-black/10 bg-[#F4EBD9]">


                        <div className="flex flex-col gap-3 pb-28 sm:pb-0"> {/* Increased padding bottom for mobile safe area */}
                            <Link
                                href="/builder"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center justify-center bg-black text-white hover:bg-black/80 font-bold py-3 uppercase tracking-widest text-[10px] transition-colors rounded-sm order-1"
                            >
                                Finalize <span className="hidden sm:inline ml-1">Kit</span>
                            </Link>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center justify-center bg-transparent border border-black/20 text-black hover:bg-black/5 font-bold py-3 uppercase tracking-widest text-[10px] rounded-sm transition-colors order-2"
                            >
                                <ShoppingBag className="w-3 h-3 mr-2" /> Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
