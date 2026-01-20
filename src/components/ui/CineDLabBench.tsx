import Link from 'next/link';
import { ExternalLink, Activity } from 'lucide-react';

interface LabMetrics {
    dynamic_range_stops?: {
        snr_2: number;
        snr_1: number;
    };
    rolling_shutter_ms?: number;
    base_iso?: number | string;
    latitude_stops?: number;
    source_url?: string;
}

export function CineDLabBench({ metrics }: { metrics: LabMetrics }) {
    if (!metrics) return null;

    return (
        <div className="bg-card border-t-2 border-primary mt-12 mb-8">
            <div className="py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-serif italic text-foreground flex items-center gap-2">
                        {/* Icons are often removed in new minimal style, but keeping a simple one or just text */}
                        <Activity className="h-5 w-5" />
                        CineD Lab Bench
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans mt-1">
                        Independent sensor performance data.
                    </p>
                </div>
                {metrics.source_url && (
                    <Link
                        href={metrics.source_url}
                        target="_blank"
                        className="text-xs uppercase font-bold tracking-widest border-b border-primary pb-0.5 hover:opacity-60 transition-opacity flex items-center gap-2"
                    >
                        Read Full Test <ExternalLink className="h-3 w-3" />
                    </Link>
                )}
            </div>

            <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Dynamic Range Section */}
                {metrics.dynamic_range_stops && (
                    <div className="space-y-6">
                        <div className="flex items-end justify-between border-b border-border/20 pb-2">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                Dynamic Range
                            </h4>
                            <span className="text-3xl font-serif italic text-foreground leading-none">
                                {metrics.dynamic_range_stops.snr_2} <span className="text-sm font-sans font-normal text-muted-foreground opacity-60">stops</span>
                            </span>
                        </div>

                        <div className="space-y-6">
                            {/* SNR 2 Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono">
                                    <span>SNR=2 (High Quality)</span>
                                    <span>{metrics.dynamic_range_stops.snr_2}</span>
                                </div>
                                <div className="h-4 w-full border border-primary/20 bg-secondary/50">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(metrics.dynamic_range_stops.snr_2 / 17) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* SNR 1 Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono">
                                    <span>SNR=1 (Low Noise Floor)</span>
                                    <span>{metrics.dynamic_range_stops.snr_1}</span>
                                </div>
                                <div className="h-4 w-full border border-primary/20 bg-secondary/50">
                                    <div
                                        className="h-full bg-primary/40 pattern-diagonal-lines"
                                        style={{ width: `${(metrics.dynamic_range_stops.snr_1 / 17) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">*Scale ref: 17 stops (ALEV 4)</p>
                        </div>
                    </div>
                )}

                {/* Rolling Shutter & Latitude */}
                <div className="space-y-8">
                    {/* Rolling Shutter */}
                    {metrics.rolling_shutter_ms !== undefined && (
                        <div className="space-y-4">
                            <div className="flex items-end justify-between border-b border-border/20 pb-2">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                    Rolling Shutter
                                </h4>
                                <span className="text-xl font-mono text-foreground">
                                    {metrics.rolling_shutter_ms === 0 ? 'Global' : `${metrics.rolling_shutter_ms}ms`}
                                </span>
                            </div>

                            <div className="h-4 w-full border border-primary/20 bg-secondary/50 relative">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${Math.min((metrics.rolling_shutter_ms / 20) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono">Lower is better. &lt;5ms is excellent.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-8">
                        {/* Latitude */}
                        {metrics.latitude_stops && (
                            <div className="space-y-1">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Latitude</h4>
                                <div className="text-2xl font-serif italic text-foreground">
                                    {metrics.latitude_stops}<span className="text-sm font-sans opacity-60 ml-1">stops</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-tight">Exposure flexibility</p>
                            </div>
                        )}

                        {/* Base ISO */}
                        {metrics.base_iso && (
                            <div className="space-y-1">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Test Base ISO</h4>
                                <div className="text-2xl font-mono text-foreground">{metrics.base_iso}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
