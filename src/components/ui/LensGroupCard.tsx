'use client';

import { useState } from 'react';
import { EquipmentItem } from '@/types';
import { useKit } from '@/context/KitContext';
import { Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface LensGroupCardProps {
    items: EquipmentItem[];
}

export function LensGroupCard({ items }: LensGroupCardProps) {
    const { addItems } = useKit();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isExpanded, setIsExpanded] = useState(false);

    // Sort by integer value of focal length
    const sortedItems = [...items].sort((a, b) => {
        const getVal = (s?: string) => parseInt(s?.replace(/\D/g, '') || '0');
        return getVal(a.specs.focal_length) - getVal(b.specs.focal_length);
    });

    const firstItem = sortedItems[0];
    const brand = firstItem.brand;
    const model = firstItem.model;

    const toggleSelection = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleAddSelected = (e: React.MouseEvent) => {
        e.stopPropagation();
        const toAdd = sortedItems.filter(item => selectedIds.has(item.id));
        if (toAdd.length > 0) {
            addItems(toAdd);
            setSelectedIds(new Set()); // Reset selection
        }
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="col-span-full bg-card rounded-lg border border-border overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header / Summary Section (Click to Expand) */}
            <div
                onClick={toggleExpand}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 cursor-pointer hover:bg-secondary/5 transition-colors relative group"
            >
                {/* Image Removed as per request */}

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground leading-none">{model}</h3>
                        {firstItem.specs.squeeze && (
                            <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] uppercase font-bold rounded-sm">
                                {firstItem.specs.squeeze}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{brand} • {sortedItems.length} Lenses</p>

                    {/* Collapsed View: Focal Length Badges */}
                    {!isExpanded && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {sortedItems.map(item => (
                                <span key={item.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-muted/50 text-muted-foreground">
                                    {item.specs.focal_length}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 ml-auto">
                    <button
                        onClick={handleAddSelected}
                        disabled={selectedIds.size === 0}
                        className="
                            h-9 px-4 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all
                            bg-primary text-primary-foreground hover:bg-primary/90
                            disabled:opacity-0 disabled:pointer-events-none
                        "
                    >
                        <Plus className="w-3 h-3" />
                        Add ({selectedIds.size})
                    </button>

                    <div className="text-muted-foreground/50 group-hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {/* Detailed Specs Table (Visible when Expanded) */}
            {isExpanded && (
                <div className="border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase tracking-wider bg-muted/20 border-b border-border/50">
                                <tr>
                                    <th className="px-4 py-2 font-medium w-12 text-center">#</th>
                                    <th className="px-4 py-2 font-medium">Focal Length</th>
                                    <th className="px-4 py-2 font-medium">Aperture</th>
                                    <th className="px-4 py-2 font-medium">Close Focus</th>
                                    <th className="px-4 py-2 font-medium">Weight</th>
                                    <th className="px-4 py-2 font-medium">Front Dia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {sortedItems.map(item => {
                                    const isSelected = selectedIds.has(item.id);
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={(e) => toggleSelection(item.id, e)}
                                            className={`
                                                cursor-pointer transition-colors hover:bg-muted/30
                                                ${isSelected ? 'bg-primary/5' : ''}
                                            `}
                                        >
                                            <td className="px-4 py-2 text-center">
                                                <div
                                                    className={`
                                                        w-4 h-4 rounded border mx-auto flex items-center justify-center transition-all
                                                        ${isSelected
                                                            ? 'bg-primary border-primary text-primary-foreground'
                                                            : 'bg-background border-input'}
                                                    `}
                                                >
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 font-bold font-mono text-foreground">
                                                {item.specs.focal_length}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-muted-foreground">
                                                {item.specs.aperture || '-'}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-muted-foreground">
                                                {item.specs.close_focus_m ? `${item.specs.close_focus_m}m` : '-'}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-muted-foreground">
                                                {item.specs.weight_kg ? `${item.specs.weight_kg}kg` : '-'}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-muted-foreground">
                                                {item.specs.front_diameter_mm ? `${item.specs.front_diameter_mm}mm` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

