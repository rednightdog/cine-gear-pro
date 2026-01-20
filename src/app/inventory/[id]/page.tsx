import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { AddToKitButton } from '@/components/ui/AddToKitButton';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { ArrowLeft, Box } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { checkLensCoverage, formatDiagonal, parseSensorDimensions } from '@/lib/coverage';
import CoverageBadge from '@/components/ui/CoverageBadge';
import { CineDLabBench } from '@/components/ui/CineDLabBench';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage(props: PageProps) {
    const params = await props.params;

    // Parallel fetching for performance
    const [item, allEquipment] = await Promise.all([
        db.equipment.getById(params.id),
        db.equipment.getAll()
    ]);

    const isAdmin = await isAuthenticated();

    // Debug
    console.log('Rendering Product:', item?.id);

    if (!item) {
        notFound();
    }

    // --- AI Lens Coverage Logic ---
    let coverageMatches: any[] = [];

    // Logic 1: If Item is CAMERA -> Show Compatible Lenses
    if (item.category === 'Camera' && item.specs.sensor_size) {
        const lenses = allEquipment.filter(e => e.category === 'Lens' && e.specs.image_circle_mm);
        coverageMatches = lenses.map(lens => {
            const result = checkLensCoverage(lens, item);
            return { item: lens, result };
        }).sort((a, b) => {
            // Sort by: Covers first, then by Brand, then by Focal Length (roughly by name)
            if (a.result.status !== b.result.status) {
                return a.result.status === 'covers' ? -1 : 1;
            }
            return a.item.brand.localeCompare(b.item.brand) || a.item.name.localeCompare(b.item.name);
        });
    }
    // Logic 2: If Item is LENS -> Show Compatible Cameras
    else if (item.category === 'Lens' && item.specs.image_circle_mm) {
        const cameras = allEquipment.filter(e => e.category === 'Camera' && e.specs.sensor_size);
        coverageMatches = cameras.map(cam => {
            const result = checkLensCoverage(item, cam);
            return { item: cam, result };
        }).sort((a, b) => {
            if (a.result.status !== b.result.status) {
                return a.result.status === 'covers' ? -1 : 1;
            }
            return a.item.brand.localeCompare(b.item.brand) || a.item.name.localeCompare(b.item.name);
        });
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Breadcrumb / Back */}
                <Link
                    href="/inventory"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Catalog
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Visual Side */}
                    <div className="space-y-6">
                        <div className="aspect-square w-full rounded-2xl bg-white/5 border border-border/50 shadow-2xl flex items-center justify-center p-8 overflow-hidden relative group">
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <Box className="h-32 w-32 text-muted-foreground/20" />
                            )}
                        </div>
                        {isAdmin && (
                            <div className="flex justify-center">
                                <DeleteButton id={item.id} />
                            </div>
                        )}
                    </div>

                    {/* Info Side */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                                    {item.category} / {item.subcategory || 'General'}
                                </span>
                                {item.specs.mount && (
                                    <span className="text-xs font-medium text-secondary-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                                        {item.specs.mount} Mount
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">{item.name}</h1>
                            <p className="text-xl text-muted-foreground mt-1">{item.brand}</p>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                            <h3 className="font-semibold text-foreground border-b border-border pb-2">Technical Specifications</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div className="flex justify-between border-b border-border/30 pb-1">
                                    <span className="text-muted-foreground">Manufacturer</span>
                                    <span className="font-medium text-foreground">{item.brand}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/30 pb-1">
                                    <span className="text-muted-foreground">Model</span>
                                    <span className="font-medium text-foreground">{item.model}</span>
                                </div>
                                {Object.entries(item.specs).map(([key, value]) => {
                                    if (key === 'recording_formats' || !value || (typeof value !== 'string' && typeof value !== 'number')) return null;
                                    return (
                                        <div key={key} className="flex justify-between border-b border-border/30 pb-1">
                                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                            <span className="font-medium text-foreground">{value}</span>
                                        </div>
                                    );
                                })}
                                <div className="flex justify-between border-b border-border/30 pb-1">
                                    <span className="text-muted-foreground">Daily Rate (Est.)</span>
                                    <span className="font-medium text-primary">${item.daily_rate_est}</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Recording Formats Table */}
                        {item.specs.recording_formats && item.specs.recording_formats.length > 0 && (
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-border bg-secondary/20">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        Recording Formats
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/10">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Resolution</th>
                                                <th className="px-4 py-3 font-medium">Codec</th>
                                                <th className="px-4 py-3 font-medium text-right">Max FPS</th>
                                                <th className="px-4 py-3 font-medium text-right">Data Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.specs.recording_formats.map((fmt: any, i: number) => (
                                                <tr key={i} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-foreground">{fmt.resolution}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        <span className="bg-secondary px-2 py-1 rounded text-xs border border-border">{fmt.codec}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-foreground">{fmt.max_fps}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt.data_rate || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- CINED LAB BENCH --- */}
                        {item.lab_metrics && <CineDLabBench metrics={item.lab_metrics} />}

                        {/* Deep Technical Data Sections (Datasheet) */}
                        {item.technical_data && item.technical_data.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-foreground pt-4">Technical Datasheets</h3>
                                {item.technical_data.map((section: any, idx: number) => (
                                    <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                                        <div className="p-3 border-b border-border bg-secondary/30">
                                            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">{section.title}</h4>
                                        </div>
                                        <div className="p-0">
                                            {section.items.map((dataItem: any, i: number) => (
                                                <div key={i} className={`flex flex-col sm:flex-row sm:justify-between sm:items-start p-3 text-sm border-b border-border/30 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-secondary/5'}`}>
                                                    <span className="text-muted-foreground sm:w-1/3 mb-1 sm:mb-0 pr-4">{dataItem.label}</span>
                                                    <span className="font-medium text-foreground sm:w-2/3 text-left sm:text-right whitespace-pre-line">{dataItem.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- AI: LENS COVERAGE ASSISTANT --- */}
                        {coverageMatches.length > 0 && (
                            <div className="bg-card border border-border rounded-xl overflow-hidden mt-8 ring-1 ring-white/10">
                                <div className="p-4 border-b border-border bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        ✨ {item.category === 'Camera' ? 'Recommended Lenses (Coverage Check)' : 'Compatible Cameras (Coverage Check)'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Calculated based on {item.category === 'Camera' ? `Sensor Diagonal: ${formatDiagonal(parseSensorDimensions(item.specs.sensor_size!)?.diagonal || 0)}` : `Image Circle: ${item.specs.image_circle_mm}mm`}
                                    </p>
                                </div>
                                <div className="divide-y divide-border/50 max-h-96 overflow-y-auto bg-black/20">
                                    {coverageMatches.map(({ item: matchItem, result }) => (
                                        <Link
                                            key={matchItem.id}
                                            href={`/inventory/${matchItem.id}`}
                                            className="flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Mini Thumbnail */}
                                                <div className="w-10 h-10 rounded bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {matchItem.image_url ? (
                                                        <img src={matchItem.image_url} alt={matchItem.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-2 h-2 rounded-full bg-muted" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                        {matchItem.name}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {matchItem.category === 'Lens' ? `IC: ${matchItem.specs.image_circle_mm}mm` : `Diag: ${formatDiagonal(parseSensorDimensions(matchItem.specs.sensor_size!)?.diagonal || 0)}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <CoverageBadge
                                                    status={result.status}
                                                    diff={result.diff}
                                                    sensorDiagonal={item.category === 'Camera' ? parseSensorDimensions(item.specs.sensor_size!)?.diagonal : parseSensorDimensions(matchItem.specs.sensor_size!)?.diagonal}
                                                    imageCircle={item.category === 'Lens' ? item.specs.image_circle_mm : matchItem.specs.image_circle_mm}
                                                    compact
                                                />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 mt-auto">
                            <AddToKitButton item={item} className="w-full text-lg h-14" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
