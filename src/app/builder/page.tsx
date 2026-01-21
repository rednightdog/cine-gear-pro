'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useKit } from '@/context/KitContext';
import { Camera, Grip, Trash2, Save, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import { SpecBadge } from '@/components/ui/SpecBadge';

import { getKit, saveKit } from '@/app/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BuilderPage() {
    const { items, addItem, updateQuantity, removeItem, clearKit, notes, setNotes, updateItemNote, projectDetails, updateProjectDetail, addItems } = useKit();
    const router = useRouter();
    const searchParams = useSearchParams();
    const kitId = searchParams.get('kitId');
    const [isExporting, setIsExporting] = useState(false);

    // Load kit data if kitId is present
    useEffect(() => {
        if (!kitId) return;

        async function loadKit() {
            const res = await getKit(kitId!);
            if (res.success && res.kit) {
                clearKit();

                // Safely parse project details
                if (res.kit.projectDetails) {
                    try {
                        const parsed = JSON.parse(res.kit.projectDetails as string);
                        Object.keys(parsed).forEach(key => {
                            updateProjectDetail(key as any, parsed[key]);
                        });
                    } catch (e) { console.error("Error parsing project details", e); }
                }

                if (res.kit.description) {
                    setNotes(res.kit.description);
                }

                if (res.kit.items) {
                    res.kit.items.forEach((kitItem: any) => {
                        // If it has a related equipment item, use that but ensure specs is populated
                        if (kitItem.equipment) {
                            // Re-construct the item object as the app expects it (EquipmentItem type)
                            // Standard items from DB have flattened specs, we need to nest them back into 'specs'
                            const itemWithSpecs = {
                                ...kitItem.equipment,
                                specs: {
                                    mount: kitItem.equipment.mount,
                                    weight_kg: kitItem.equipment.weight_kg,
                                    resolution: kitItem.equipment.resolution,
                                    focal_length: kitItem.equipment.focal_length,
                                    aperture: kitItem.equipment.aperture,
                                    sensor_size: kitItem.equipment.sensor_size,
                                    close_focus_m: kitItem.equipment.close_focus_m,
                                    front_diameter_mm: kitItem.equipment.front_diameter_mm,
                                    length_mm: kitItem.equipment.length_mm,
                                    squeeze: kitItem.equipment.squeeze,
                                    payload_kg: kitItem.equipment.payload_kg,
                                }
                            };
                            addItem(itemWithSpecs, kitItem.quantity, kitItem.notes);
                        } else {
                            // Reconstruct Custom Item
                            const customItem = {
                                id: 'custom-' + Math.random().toString(36).substr(2, 9), // Generate temp ID if needed or just use kitItem.id? Using temp for now to match flow
                                name: kitItem.customName || 'Custom Item',
                                brand: kitItem.customBrand || '',
                                category: kitItem.customCategory || 'Other',
                                description: kitItem.customDescription || '',
                                daily_rate_est: 0,
                                imageUrl: '/equipment/default-placeholder.png',
                                model: 'Custom',
                                specs: {} // Important: Initialize empty specs
                            };
                            addItem(customItem, kitItem.quantity, kitItem.notes);
                        }
                    });
                }
            } else {
                alert('Failed to load kit: ' + res.message);
            }
        }

        loadKit();
    }, [kitId, getKit]);

    const handleSave = async () => {
        const name = prompt('Name your kit:', projectDetails.projectName ? `${projectDetails.projectName} - Kit` : 'My Cinema Package');
        if (!name) return;

        // Pass project names and notes to be saved
        const result = await saveKit(name, items, projectDetails, notes);
        if (result.success) {
            alert(`Kit saved successfully!`);
        } else {
            alert('Failed to save kit: ' + result.message);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 50));

        const doc = new jsPDF();

        // Helper to load font
        const loadFont = async (path: string) => {
            try {
                const res = await fetch(path);
                if (!res.ok) {
                    console.error(`Fetch failed for ${path}: ${res.status} ${res.statusText}`);
                    return null;
                }
                const blob = await res.blob();
                if (blob.size < 100) {
                    console.error(`Font file too small (likely invalid): ${path} (${blob.size} bytes)`);
                    return null;
                }

                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        // Strip the Data URI prefix (e.g. "data:application/octet-stream;base64,")
                        const base64Content = base64data.split(',')[1];
                        resolve(base64Content);
                    };
                    reader.onerror = (e) => {
                        console.error('FileReader error:', e);
                        reject(e);
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.error('Error loading font:', err);
                return null;
            }
        };

        try {
            // Load and Add Fonts
            const fontRegular = await loadFont('/fonts/Roboto-Regular.ttf');
            const fontBold = await loadFont('/fonts/Roboto-Bold.ttf');

            // Check for valid base64
            if (fontRegular) {
                doc.addFileToVFS('Roboto-Regular.ttf', fontRegular);
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            }

            if (fontBold) {
                doc.addFileToVFS('Roboto-Bold.ttf', fontBold);
                doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
            }

            // Apply Font
            doc.setFont('Roboto', 'normal');
        } catch (error) {
            console.error('Failed to load local fonts, falling back to standard.', error);
            // Fallback to helvetica if Roboto fails
            doc.setFont('helvetica', 'normal');
        }

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Roboto', 'normal'); // Ensure font is set
        doc.text('Equipment List', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Created on: ${new Date().toLocaleDateString()}`, 14, 26);

        // Project Info Block
        doc.setFontSize(10);
        doc.setTextColor(0);

        const startY = 35;
        let currentY = startY;
        const col1X = 14;
        const col2X = 110;

        // Helper to Draw Field
        const drawField = (label: string, value: string, x: number, y: number) => {
            doc.setFont('Roboto', 'bold');
            doc.text(label + ':', x, y);
            doc.setFont('Roboto', 'normal');
            doc.text(value || '-', x + 35, y);
        };

        if (projectDetails.projectName) {
            doc.setFontSize(14);
            doc.setFont('Roboto', 'bold');
            doc.text(projectDetails.projectName, 14, currentY);
            currentY += 8;
        }

        doc.setFontSize(10);
        drawField('Production', projectDetails.productionCompany, col1X, currentY);
        const formatRange = (start: string, end: string) => {
            if (!start) return '-';
            const s = new Date(start).toLocaleDateString();
            const e = end ? new Date(end).toLocaleDateString() : '';
            return e ? `${s} - ${e}` : s;
        };

        drawField('Shoot Date', formatRange(projectDetails.shootDateStart, projectDetails.shootDateEnd), col2X, currentY);
        currentY += 6;

        drawField('Director', projectDetails.director, col1X, currentY);
        drawField('Test Date', formatRange(projectDetails.testDateStart, projectDetails.testDateEnd), col2X, currentY);
        currentY += 6;

        drawField('DoP', projectDetails.dop, col1X, currentY);
        currentY += 6;

        drawField('1st AC', projectDetails.cameraAssistant, col1X, currentY);
        currentY += 10;

        // Final spacing before table
        const tableStartY = currentY + 2;

        // Prep Columns
        const headers = ['Category', 'Description', 'Mount', 'Qty'];


        // Table Data
        const tableData = items.map(kitItem => {
            const { item, quantity, notes: itemNotes } = kitItem;
            // Combine Name + Brand + Note for the Description column
            let description = `${item.brand} ${item.name}`;
            if (itemNotes) {
                description += `\n>> ${itemNotes}`;
            }

            const row = [
                item.category,
                description,
                item.specs.mount || '-',
                // @ts-ignore
                quantity
            ];
            return row;
        });

        // AutoTable - Formal Theme
        autoTable(doc, {
            startY: tableStartY,
            head: [headers],
            body: tableData,
            theme: 'plain',
            styles: {
                font: 'Roboto', // Use the custom font
                textColor: 0,
                fontSize: 10,
                cellPadding: 4,
                valign: 'top', // Ensure text aligns top if cell is tall
                fontStyle: 'normal'
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [230, 230, 230]
            },
            columnStyles: {
                1: { cellWidth: 'auto', minCellWidth: 60 }, // Give description more room
                0: { fontStyle: 'bold' },

            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;



        // Notes Section
        if (notes.trim()) {
            const notesY = finalY + 10;
            doc.setFontSize(14);
            doc.setFont('Roboto', 'bold');
            doc.text('Notes / Remarks:', 14, notesY);

            doc.setFontSize(10);
            doc.setFont('Roboto', 'normal');
            doc.setTextColor(50);
            const splitNotes = doc.splitTextToSize(notes, 180);
            doc.text(splitNotes, 14, notesY + 6);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont('Roboto', 'normal');
        doc.text('Generated by CineGear Pro', 14, 285);

        // Mobile-friendly save/open
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const blob = doc.output('blob');
            window.open(URL.createObjectURL(blob), '_blank');
        } else {
            doc.save('equipment-list.pdf');
        }

        setIsExporting(false);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6 bg-background text-foreground">
                <div className="border border-black/10 rounded-full h-32 w-32 flex items-center justify-center">
                    <span className="font-serif italic text-4xl">0</span>
                </div>
                <h1 className="text-4xl font-serif italic">Your kit is empty.</h1>
                <p className="text-muted-foreground max-w-md font-sans text-sm tracking-wide">
                    Start by adding cameras and lenses from the catalog.
                </p>
                <Link
                    href="/inventory"
                    className="border-b border-black text-black pb-1 hover:opacity-50 transition-opacity uppercase tracking-widest text-xs font-bold"
                >
                    Browse Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10 pb-40 text-foreground">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-black/10 pb-6 gap-6">
                    <div>
                        <span className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Workspace</span>
                        <h1 className="text-5xl font-serif italic tracking-tight">Kit Builder</h1>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                        <Link
                            href="/inventory"
                            className="bg-secondary text-foreground px-4 py-2 rounded-sm hover:bg-secondary/80 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                            + Add Item
                        </Link>
                        <button
                            onClick={clearKit}
                            className="text-destructive hover:text-destructive/70 transition-colors uppercase tracking-widest text-xs"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSave}
                            className="text-foreground hover:opacity-50 transition-opacity uppercase tracking-widest text-xs"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="text-foreground hover:opacity-50 transition-opacity uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isExporting ? 'Exporting...' : 'Download PDF'}
                        </button>
                        <Link
                            href="/builder/print"
                            className="bg-black text-white px-4 py-2 rounded-sm hover:bg-black/80 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                            Visual Export
                        </Link>
                    </div>
                </div>

                {/* Options Panel - Minimalist */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">Project Name</label>
                                <input
                                    type="text"
                                    value={projectDetails.projectName}
                                    onChange={(e) => updateProjectDetail('projectName', e.target.value)}
                                    className="w-full bg-transparent border-b border-black/20 py-2 text-xl font-serif italic focus:outline-none focus:border-black transition-colors placeholder:text-black/10"
                                    placeholder="Untitled Project"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">Production</label>
                                <input
                                    type="text"
                                    value={projectDetails.productionCompany}
                                    onChange={(e) => updateProjectDetail('productionCompany', e.target.value)}
                                    className="w-full bg-transparent border-b border-black/20 py-2 text-base focus:outline-none focus:border-black transition-colors"
                                    placeholder="Company Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">Director</label>
                                <input
                                    type="text"
                                    value={projectDetails.director}
                                    onChange={(e) => updateProjectDetail('director', e.target.value)}
                                    className="w-full bg-transparent border-b border-black/20 py-2 text-base focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">DoP</label>
                                <input
                                    type="text"
                                    value={projectDetails.dop}
                                    onChange={(e) => updateProjectDetail('dop', e.target.value)}
                                    className="w-full bg-transparent border-b border-black/20 py-2 text-base focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">1st AC</label>
                                <input
                                    type="text"
                                    value={projectDetails.cameraAssistant}
                                    onChange={(e) => updateProjectDetail('cameraAssistant', e.target.value)}
                                    className="w-full bg-transparent border-b border-black/20 py-2 text-base focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">Shoot Dates</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={projectDetails.shootDateStart}
                                        onChange={(e) => updateProjectDetail('shootDateStart', e.target.value)}
                                        className="w-full bg-transparent border-b border-black/10 py-1 text-sm focus:outline-none focus:border-black"
                                    />
                                    <span className="self-center">-</span>
                                    <input
                                        type="date"
                                        value={projectDetails.shootDateEnd}
                                        onChange={(e) => updateProjectDetail('shootDateEnd', e.target.value)}
                                        className="w-full bg-transparent border-b border-black/10 py-1 text-sm focus:outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-black/50">Test Dates</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={projectDetails.testDateStart}
                                        onChange={(e) => updateProjectDetail('testDateStart', e.target.value)}
                                        className="w-full bg-transparent border-b border-black/10 py-1 text-sm focus:outline-none focus:border-black"
                                    />
                                    <span className="self-center">-</span>
                                    <input
                                        type="date"
                                        value={projectDetails.testDateEnd}
                                        onChange={(e) => updateProjectDetail('testDateEnd', e.target.value)}
                                        className="w-full bg-transparent border-b border-black/10 py-1 text-sm focus:outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-8">
                            <label className="text-xs font-mono uppercase tracking-widest text-black/50">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="..."
                                className="w-full bg-transparent border-b border-black/20 py-2 text-sm min-h-[80px] focus:outline-none focus:border-black resize-none"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        {/* Summary Block */}
                        <div className="bg-black/5 p-6 rounded-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono uppercase tracking-widest">Total Items</span>
                                <span className="font-serif text-xl">{items.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono uppercase tracking-widest">Total Items</span>
                                <span className="font-serif text-xl">{items.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-0 divider-y divide-black/10 border-t border-black/10">
                    {(() => {
                        // Grouping Logic matching KitSidebar but for main Builder view
                        const groups = new Map<string, {
                            items: any[],

                        }>();
                        const singles: any[] = [];

                        items.forEach(kitItem => {
                            const { item } = kitItem;
                            if (item.category === 'Lens' && (item.subcategory === 'Prime' || item.subcategory === 'Anamorphic')) {
                                const key = `${item.brand} ${item.model}`;
                                if (!groups.has(key)) {
                                    groups.set(key, {
                                        items: [],

                                    });
                                }
                                const group = groups.get(key)!;
                                group.items.push(kitItem);

                            } else {
                                singles.push(kitItem);
                            }
                        });


                        // Sort groups keys to ensure order?
                        // Render Singles
                        const renderItem = (kitItem: any, index: number) => {
                            const { item, quantity, notes: itemNotes } = kitItem;
                            return (
                                <div key={`${item.id}-${index}`} className="py-6 flex flex-col md:flex-row gap-6 md:items-baseline group hover:bg-black/5 transition-colors -mx-4 px-4 rounded-sm">
                                    {/* Qty */}
                                    <div className="flex items-center gap-3 w-32 flex-shrink-0">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-6 h-6 flex items-center justify-center border border-black/20 rounded-full hover:bg-black hover:text-white transition-colors text-xs"
                                        >
                                            -
                                        </button>
                                        <span className="font-mono text-lg w-6 text-center">{quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-6 h-6 flex items-center justify-center border border-black/20 rounded-full hover:bg-black hover:text-white transition-colors text-xs"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-3 mb-1">
                                            <h3 className="text-xl font-medium text-foreground">{item.name}</h3>
                                            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{item.brand}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                                            <span>{item.category}</span>
                                            {item.specs?.mount && <span>mount: {item.specs.mount}</span>}
                                            {item.specs.weight_kg && <span>{item.specs.weight_kg}kg</span>}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Add note..."
                                            value={itemNotes || ''}
                                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                                            className="bg-transparent text-xs w-full max-w-md focus:outline-none text-red-800 placeholder:text-black/20 italic"
                                        />
                                    </div>

                                    {/* Rate/Remove */}
                                    <div className="flex items-center gap-6 w-48 justify-end">

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-black/20 hover:text-destructive transition-colors uppercase tracking-widest text-[10px]"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        };

                        const renderGroup = (key: string, group: { items: any[] }) => {
                            // Sort by focal length logic
                            const sortedGroupItems = [...group.items].sort((a, b) => {
                                const getVal = (s?: string) => parseInt(s?.replace(/\D/g, '') || '0');
                                return getVal(a.item.specs.focal_length) - getVal(b.item.specs.focal_length);
                            });

                            return (
                                <div key={key} className="py-6 flex flex-col gap-4 border-b border-black/10 group hover:bg-black/5 transition-colors -mx-4 px-4 rounded-sm">
                                    {/* Set Header */}
                                    <div className="flex flex-col md:flex-row gap-6 md:items-baseline">
                                        {/* Qty Placeholder (Sets don't have single qty, maybe total items count?) */}
                                        <div className="w-32 flex-shrink-0 flex items-center justify-center">
                                            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground border border-black/20 px-2 py-1 rounded-sm">
                                                {sortedGroupItems.length} Lenses
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-3 mb-1">
                                                <h3 className="text-xl font-medium text-foreground uppercase tracking-tight">{key}</h3>
                                            </div>
                                            {/* Focal Lengths List */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {sortedGroupItems.map((k) => (
                                                    <div key={k.item.id} className="relative group/lens bg-black/5 hover:bg-black/10 transition-colors rounded-sm px-3 py-2 flex items-center min-w-[60px] justify-center">
                                                        <span className="font-mono text-sm font-bold">{k.item.specs.focal_length}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeItem(k.item.id); }}
                                                            className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover/lens:opacity-100 transition-opacity"
                                                            title="Remove Lens"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Rate */}
                                        <div className="flex items-center gap-6 w-48 justify-end self-start">

                                        </div>
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <>
                                {singles.map((item, idx) => renderItem(item, idx))}
                                {Array.from(groups.entries()).map(([key, group]) => renderGroup(key, group))}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
