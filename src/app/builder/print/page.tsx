'use client';

import Link from 'next/link';
import { useKit } from '@/context/KitContext';
import { GeometricPattern } from '@/components/ui/GeometricPattern';
import { useEffect, useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';

// Load fonts
const playfair = Playfair_Display({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function PrintPage() {
    const { items, projectDetails, notes } = useKit();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to print automatically or via button
    const handlePrint = async () => {
        // Try window.print first for desktop
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.print();
            return;
        }

        // Mobile / Fallback: Generate PDF from DOM
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const element = document.getElementById('print-area');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2, // Retain quality
                useCORS: true,
                backgroundColor: '#FDF5E6'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // A4 Dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`${projectDetails.projectName || 'equipment-list'}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF oluşturulamadı. Lütfen ekran görüntüsü almayı deneyin.');
        }
    };

    if (!mounted) return null;

    // Group items by category for a cleaner tiered look
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.item.category]) acc[item.item.category] = [];
        acc[item.item.category].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    const categories = Object.keys(groupedItems).sort();

    // Date formatting
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className={`min-h-screen bg-[#FDF5E6] text-[#1A1A1A] p-8 md:p-16 print:p-0 print:bg-[#FDF5E6] ${inter.className}`}>
            {/* Control Bar - Hidden in Print */}
            <div
                className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md px-4 pb-4 flex justify-between items-center border-b border-gray-200 print:hidden z-50 transition-all"
                style={{ paddingTop: 'max(env(safe-area-inset-top) + 16px, 16px)' }}
            >
                <div className="font-medium text-sm">Visual Print Preview</div>
                <div className="flex gap-4">
                    <Link href="/builder" className="text-sm hover:underline self-center">Back to Builder</Link>
                    <button
                        onClick={handlePrint}
                        className="bg-[#1A1A1A] text-[#FDF5E6] px-4 py-2 rounded text-sm hover:bg-black transition-colors"
                    >
                        Save as PDF
                    </button>
                </div>
            </div>

            {/* Main Page Content - A4 Ratio Approx */}
            <div id="print-area" className={`max-w-[210mm] mx-auto bg-[#FDF5E6] relative min-h-[297mm] print:w-full print:max-w-none`}>

                {/* Header Section */}
                <header className="flex justify-between items-start mb-16 pt-12 print:pt-0">
                    <div className="max-w-lg">
                        <h1 className={`${playfair.className} text-5xl md:text-6xl italic leading-tight mb-2`}>
                            {projectDetails.projectName || 'Untitled Project'}
                        </h1>
                        <p className="text-sm uppercase tracking-widest opacity-60 mt-4 border-t border-black/10 pt-4 inline-block min-w-[200px]">
                            {projectDetails.productionCompany || 'Equipment List'}
                        </p>
                    </div>
                </header>

                {/* Project Details Grid */}
                <div className="flex justify-between items-start mb-16 border-b border-black/10 pb-8">
                    {/* Left Column: People */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Director</span>
                            <span className={`${playfair.className} text-base`}>{projectDetails.director || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">DoP</span>
                            <span className={`${playfair.className} text-base`}>{projectDetails.dop || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">1st AC</span>
                            <span className={`${playfair.className} text-base`}>{projectDetails.cameraAssistant || '—'}</span>
                        </div>
                    </div>

                    {/* Right Column: Dates & Totals */}
                    <div className="flex flex-col gap-4 text-left items-start">
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Shoot Date</span>
                            <span className={`${playfair.className} text-base whitespace-nowrap`}>
                                {projectDetails.shootDateStart ? (
                                    <>
                                        {new Date(projectDetails.shootDateStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        {projectDetails.shootDateEnd ? ` - ${new Date(projectDetails.shootDateEnd).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                                    </>
                                ) : dateStr}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Test Date</span>
                            <span className={`${playfair.className} text-base whitespace-nowrap`}>
                                {projectDetails.testDateStart ? (
                                    <>
                                        {new Date(projectDetails.testDateStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                        {projectDetails.testDateEnd ? ` - ${new Date(projectDetails.testDateEnd).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}` : ''}
                                    </>
                                ) : '—'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest opacity-50 mb-1">Total Items</span>
                            <span className={`${playfair.className} text-base`}>{items.length}</span>
                        </div>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="space-y-0">
                    {categories.map((category) => (
                        <div key={category} className="mb-0">
                            {/* Category Header */}
                            {/* We can make categories look like the "Tier Letters" (S, A, B...) from the examples, or just headers */}
                            <div className="flex items-baseline border-b border-black py-4">
                                <h2 className={`${playfair.className} text-2xl w-32 flex-shrink-0 italic`}>{category}</h2>
                                <div className="flex-1"></div>
                            </div>

                            {/* Items */}
                            {groupedItems[category].map((item, idx) => (
                                <div key={item.item.id} className="flex items-start border-b border-black/10 py-3 group">
                                    <div className="w-32 flex-shrink-0 text-xs opacity-40 pt-1 font-mono">
                                        {/* Optional: Model or Subcat */}
                                        {item.item.subcategory || '0' + (idx + 1)}
                                    </div>
                                    <div className="flex-1 pr-8">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="font-medium text-lg leading-snug">
                                                {item.item.brand} {item.item.name}
                                            </h3>
                                            <span className="text-sm opacity-60 font-mono ml-4 tabular-nums">x{item.quantity}</span>
                                        </div>
                                        {(item.item.description || item.notes) && (
                                            <p className="text-sm opacity-60 mt-1 max-w-md leading-relaxed">
                                                {item.notes ? `NOTE: ${item.notes}` : item.item.description}
                                            </p>
                                        )}
                                        {/* Specs Row - Enhanced */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 opacity-60 text-[10px] uppercase tracking-wider font-medium">
                                            {item.item.specs.mount && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Mount:</span> {item.item.specs.mount}
                                                </span>
                                            )}
                                            {item.item.specs.resolution && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Res:</span> {item.item.specs.resolution}
                                                </span>
                                            )}
                                            {item.item.specs.focal_length && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Focal:</span> {item.item.specs.focal_length}
                                                </span>
                                            )}
                                            {item.item.specs.aperture && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Iris:</span> {item.item.specs.aperture}
                                                </span>
                                            )}
                                            {item.item.specs.sensor_size && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Sensor:</span> {item.item.specs.sensor_size}
                                                </span>
                                            )}
                                            {/* New Lens Data */}
                                            {item.item.specs.close_focus_m && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">CF:</span> {item.item.specs.close_focus_m}m
                                                </span>
                                            )}
                                            {item.item.specs.front_diameter_mm && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Front:</span> ø{item.item.specs.front_diameter_mm}mm
                                                </span>
                                            )}
                                            {item.item.specs.squeeze && (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-50">Squeeze:</span> {item.item.specs.squeeze}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer / Total */}
                <div className="mt-16 flex justify-end items-end border-t border-black pt-8">

                </div>

                {/* Notes Block if exists */}
                {
                    notes && (
                        <div className="mt-12 bg-black/5 p-6 rounded-sm">
                            <h4 className="text-xs uppercase tracking-widest opacity-50 mb-3">Notes</h4>
                            <p className={`${playfair.className} text-lg italic opacity-80 whitespace-pre-line`}>
                                {notes}
                            </p>
                        </div>
                    )
                }

                {/* Decorative Bottom - Removed Pattern */}
                <div className="mt-24 mb-12 flex justify-center opacity-20">

                </div>
            </div>

            {/* Print Styles */}
            < style jsx global > {`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: #FDF5E6 !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style >
        </div >
    );
}
