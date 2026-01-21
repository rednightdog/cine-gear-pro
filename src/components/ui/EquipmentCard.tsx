'use client';

import { useKit } from '@/context/KitContext';
import { EquipmentItem } from '@/types';
import { SpecBadge } from './SpecBadge';
import { Plus, Check, Minus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface EquipmentCardProps {
    item: EquipmentItem;
    viewMode?: 'grid' | 'list' | 'list-minimal';
}

export function EquipmentCard({ item, viewMode = 'grid' }: EquipmentCardProps) {
    const { addItem, items, updateQuantity } = useKit();
    const [isAdded, setIsAdded] = useState(false);

    const existingItem = items.find(i => i.item.id === item.id);
    const quantity = existingItem ? existingItem.quantity : 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Stop Link propagation
        addItem(item);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);
    };

    if (viewMode === 'list-minimal') {
        return (
            quantity > 0 ? (
                <div className="inline-flex items-center bg-transparent border border-black/20 rounded-sm">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            updateQuantity(item.id, -1);
                        }}
                        className="px-2 py-1 text-black hover:bg-black/10 transition-colors"
                    >
                        <Minus size={10} />
                    </button>
                    <span className="px-1 text-xs font-mono min-w-[2ch] text-center">{quantity}</span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addItem(item);
                            setIsAdded(true);
                            setTimeout(() => setIsAdded(false), 1000);
                        }}
                        className="px-2 py-1 text-black hover:bg-black/10 transition-colors"
                    >
                        <Plus size={10} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleAdd}
                    className={`inline-flex items-center justify-center rounded-sm px-3 py-1 text-xs font-medium transition-colors uppercase tracking-wider relative ${isAdded ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:bg-black hover:text-white'}`}
                >
                    {isAdded ? (
                        <>Added <Check className="ml-1 h-3 w-3" /></>
                    ) : (
                        <>Add <Plus className="ml-1 h-3 w-3" /></>
                    )}
                </button>
            )
        );

    }

    if (viewMode === 'list') {
        return (
            <div className={`group flex items-center gap-4 p-4 border-b border-border transition-all ${quantity > 0 ? 'bg-primary/5' : 'bg-card hover:bg-secondary/30'}`}>
                {/* Visual / Icon */}
                <Link href={`/inventory/${item.id}`} className="h-16 w-16 bg-secondary/50 flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80 border border-border/20 relative">
                    {quantity > 0 && (
                        <span className="absolute top-0 right-0 flex h-6 w-6 transform translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-black text-white text-xs font-bold shadow-sm z-10">
                            {quantity}
                        </span>
                    )}
                    <div className="text-xl font-serif italic text-muted-foreground">{item.brand.charAt(0)}</div>
                </Link>

                {/* Main Info */}
                <div className="flex-1 min-w-0 flex flex-col md:grid md:grid-cols-4 gap-4 items-center">
                    <div className="w-full md:col-span-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center border border-primary px-2 py-0.5 text-[10px] uppercase font-bold text-primary tracking-wider">
                                {item.category}
                            </span>
                            <Link href={`/inventory/${item.id}`} className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                                {item.name}
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.description}</p>
                    </div>

                    {/* Specs - Compact */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {item.specs.mount && <SpecBadge label="Mount" value={item.specs.mount} />}
                        {item.specs.resolution && <SpecBadge label="Res" value={item.specs.resolution} />}
                    </div>

                    {/* Rate */}

                </div>

                {/* Actions */}
                {quantity > 0 ? (
                    <div className="flex items-center bg-black/5 rounded-sm overflow-hidden h-10 border border-black/10">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                updateQuantity(item.id, -1);
                            }}
                            className="h-full px-3 hover:bg-black/10 transition-colors border-r border-black/10 flex items-center justify-center"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="px-3 font-mono text-sm min-w-[3ch] text-center">{quantity}</span>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                addItem(item);
                                setIsAdded(true);
                                setTimeout(() => setIsAdded(false), 1000);
                            }}
                            className="h-full px-3 hover:bg-black/10 transition-colors border-l border-black/10 flex items-center justify-center"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAdd}
                        className={`h-10 w-10 flex items-center justify-center border transition-all ${isAdded ? 'bg-green-600 border-green-600 text-white' : 'bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground border-border'}`}
                        title="Add to Kit"
                    >
                        {isAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`group relative flex flex-col overflow-hidden border transition-all hover:shadow-lg hover:shadow-primary/5 ${quantity > 0 ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/5' : 'border-border bg-card'}`}>
            {/* Visual Header / Image Placeholder */}
            <Link href={`/inventory/${item.id}`} className="block relative aspect-video w-full bg-[#f0ede6] p-4 flex items-center justify-center transition-opacity hover:opacity-90 overflow-hidden border-b border-border">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                    />
                ) : (
                    <div className="text-4xl font-serif italic text-muted-foreground/20 select-none tracking-tight">
                        {item.brand}
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center bg-black/80 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        {item.category}
                    </span>
                </div>

                {/* Selected Quantity Badge */}
                {quantity > 0 && (
                    <div className="absolute top-3 left-3 animate-in zoom-in duration-200">
                        <span className="inline-flex items-center bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
                            {quantity} IN KIT
                        </span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5 gap-4">
                <div>
                    <Link href={`/inventory/${item.id}`} className="text-lg font-bold font-serif italic text-card-foreground group-hover:text-primary transition-colors block">
                        {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-sans">
                        {item.description}
                    </p>
                </div>

                {/* Specs Grid */}
                <div className="flex flex-wrap gap-2 text-xs">
                    <SpecBadge label="Mount" value={item.specs.mount} />

                    {/* Camera Specifics */}
                    {item.category === 'Camera' && (
                        <>
                            <SpecBadge label="Res" value={item.specs.resolution} />
                            {item.specs.sensor_size && (
                                <div className="px-2 py-1 bg-secondary text-foreground border border-border flex items-center gap-1" title={`Sensor: ${item.specs.sensor_size}mm`}>
                                    <span className="text-[10px] text-muted-foreground uppercase mr-1">Sensor</span>
                                    <span className="font-mono">{item.specs.sensor_type || 'N/A'}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Lens Specifics */}
                    {item.category === 'Lens' && (
                        <>
                            <SpecBadge label="Focal" value={item.specs.focal_length} />
                            <SpecBadge label="Iris" value={item.specs.aperture} />
                            {item.specs.squeeze && <SpecBadge label="Squeeze" value={item.specs.squeeze} />}
                            {item.specs.close_focus_m && <SpecBadge label="CF" value={`${item.specs.close_focus_m}m`} />}
                            {item.specs.front_diameter_mm && <SpecBadge label="Front" value={`ø${item.specs.front_diameter_mm}`} />}
                            {item.specs.length_mm && <SpecBadge label="Len" value={`${item.specs.length_mm}mm`} />}
                        </>
                    )}

                    <SpecBadge label="Weight" value={item.specs.weight_kg ? `${item.specs.weight_kg}kg` : undefined} />
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">


                    <div className="flex items-center gap-2">
                        {quantity > 0 ? (
                            <div className="flex items-center bg-black rounded-sm overflow-hidden border border-black">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        updateQuantity(item.id, -1);
                                    }}
                                    className="px-3 py-2 text-white hover:bg-white/20 transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="px-2 py-2 text-white font-mono text-sm min-w-[3ch] text-center border-l border-r border-white/20">
                                    {quantity}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addItem(item);
                                        setIsAdded(true);
                                        setTimeout(() => setIsAdded(false), 1000);
                                    }}
                                    className="px-3 py-2 text-white hover:bg-white/20 transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-bold transition-all uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card active:scale-95 transform ${isAdded ? 'bg-green-600 text-white hover:opacity-100' : 'bg-primary hover:opacity-90 text-primary-foreground focus:ring-primary/50'}`}
                            >
                                {isAdded ? (
                                    <><Check className="mr-2 h-4 w-4" /> Added</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> Add</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
