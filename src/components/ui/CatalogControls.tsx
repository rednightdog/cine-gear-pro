'use client';

import { Search, PlusCircle, LayoutGrid, List, Sun, Moon, Clapperboard } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

const CATEGORIES = ['All', 'Camera', 'Lens', 'Filter', 'Support', 'Monitor', 'Lighting', 'Audio'];

export function CatalogControls({ isAdmin }: { isAdmin?: boolean }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const { theme, setTheme, viewMode, setViewMode } = useTheme();
    const { t } = useLanguage();

    const currentCategory = searchParams.get('category') || 'All';
    const currentSearch = searchParams.get('q') || '';

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`/inventory?${params.toString()}`);
    }, 300);

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);

        // Reset specific filters when switching main category
        params.delete('subcategory');
        params.delete('format');

        if (category === 'All') {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        replace(`/inventory?${params.toString()}`);
    };

    return (
        <div className="space-y-8">
            {/* Header / Search / Controls */}
            <div className="flex flex-col gap-6 border-b border-black/10 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-serif italic text-foreground tracking-tight">{t.nav.catalog}</h1>
                        {/* <p className="text-muted-foreground mt-1 font-mono text-sm opacity-60">Browse premium cinema equipment.</p> */}
                    </div>

                    <div className="w-full md:w-96">
                        <div className="relative">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                            <input
                                type="text"
                                placeholder="Search..."
                                defaultValue={currentSearch}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-transparent border-b border-black/20 pl-6 pr-4 py-2 text-base focus:outline-none focus:border-black text-foreground placeholder:text-black/30 transition-all font-serif italic"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs - Minimal Text Links */}
            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide text-sm">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`
                            pb-1 border-b-2 transition-all font-medium uppercase tracking-widest
                            ${currentCategory === cat
                                ? 'border-black text-black'
                                : 'border-transparent text-black/40 hover:text-black/70'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Sub-Category Filter (Only for Lens) */}
            {currentCategory === 'Lens' && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                    {['All', 'Prime', 'Zoom', 'Anamorphic'].map((sub) => {
                        const currentSub = searchParams.get('subcategory') || 'All';
                        const isActive = currentSub === sub || (sub === 'All' && !searchParams.get('subcategory'));

                        return (
                            <button
                                key={sub}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    if (sub === 'All') {
                                        params.delete('subcategory');
                                    } else {
                                        params.set('subcategory', sub);
                                    }
                                    replace(`/inventory?${params.toString()}`);
                                }}
                                className={`
                                    px-3 py-1.5 rounded-full border transition-all font-medium
                                    ${isActive
                                        ? 'bg-black text-white border-black'
                                        : 'bg-transparent text-black/60 border-black/10 hover:border-black/30'
                                    }
                                `}
                            >
                                {sub}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Sensor Format Filter (Lens & Camera) */}
            {(currentCategory === 'Lens' || currentCategory === 'Camera') && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide text-xs animate-in fade-in slide-in-from-top-3 duration-300 delay-100">
                    {['All', 'S35', 'FF', 'LF'].map((fmt) => {
                        const currentFmt = searchParams.get('format') || 'All';
                        // Handle strict selection logic for visual state
                        const isActive = currentFmt === fmt || (fmt === 'All' && !searchParams.get('format'));

                        return (
                            <button
                                key={fmt}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    if (fmt === 'All') {
                                        params.delete('format');
                                    } else {
                                        params.set('format', fmt);
                                    }
                                    replace(`/inventory?${params.toString()}`);
                                }}
                                className={`
                                    px-3 py-1.5 rounded-full border transition-all font-medium
                                    ${isActive
                                        ? 'bg-black text-white border-black'
                                        : 'bg-transparent text-black/60 border-black/10 hover:border-black/30'
                                    }
                                `}
                            >
                                {fmt}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Lighting Filters (Scoped) */}
            {currentCategory === 'Lighting' && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide text-xs animate-in fade-in slide-in-from-top-3 duration-300">
                    {['All', 'LED', 'Daylight', 'Tungsten', 'Ballast', 'Modifier', 'Accessory'].map((sub) => {
                        const currentSub = searchParams.get('subcategory') || 'All';
                        const isActive = currentSub === sub || (sub === 'All' && !searchParams.get('subcategory'));

                        return (
                            <button
                                key={sub}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    if (sub === 'All') {
                                        params.delete('subcategory');
                                    } else {
                                        params.set('subcategory', sub);
                                    }
                                    replace(`/inventory?${params.toString()}`);
                                }}
                                className={`
                                    px-3 py-1.5 rounded-full border transition-all font-medium
                                    ${isActive
                                        ? 'bg-black text-white border-black'
                                        : 'bg-transparent text-black/60 border-black/10 hover:border-black/30'
                                    }
                                `}
                            >
                                {sub}
                            </button>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
