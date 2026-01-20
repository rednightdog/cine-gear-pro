'use client';

import { useKit } from '@/context/KitContext';
import { EquipmentItem } from '@/types';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';

export function AddToKitButton({ item, className }: { item: EquipmentItem, className?: string }) {
    const { addItem } = useKit();
    const [added, setAdded] = useState(false);
    const [qty, setQty] = useState(1);

    const handleClick = () => {
        addItem(item, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="bg-secondary rounded-lg flex items-center border border-border">
                <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-full px-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    -
                </button>
                <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-12 bg-transparent text-center border-none focus:ring-0 text-lg font-mono placeholder:text-muted-foreground"
                />
                <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-full px-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    +
                </button>
            </div>

            <button
                onClick={handleClick}
                className={`flex-1 inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm font-semibold transition-all shadow-lg active:scale-95 h-12 ${added
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-primary text-primary-foreground hover:bg-amber-400 shadow-primary/20'
                    }`}
            >
                {added ? (
                    <>
                        <Check className="mr-2 h-5 w-5" />
                        Added
                    </>
                ) : (
                    <>
                        <Plus className="mr-2 h-5 w-5" />
                        Add {qty > 1 ? `${qty} Items` : 'to Kit'}
                    </>
                )}
            </button>
        </div>
    );
}
