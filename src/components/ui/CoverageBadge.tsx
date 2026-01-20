import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { CoverageStatus } from '@/lib/coverage';

interface CoverageBadgeProps {
    status: CoverageStatus;
    diff?: number;
    sensorDiagonal?: number;
    imageCircle?: number;
    compact?: boolean;
}

export default function CoverageBadge({ status, diff, sensorDiagonal, imageCircle, compact = false }: CoverageBadgeProps) {
    if (status === 'unknown') {
        return (
            <div className="flex items-center gap-1.5 text-gray-500" title="Missing specs data">
                <HelpCircle className="w-4 h-4" />
                {!compact && <span className="text-sm">Unknown Coverage</span>}
            </div>
        );
    }

    if (status === 'covers') {
        return (
            <div className="flex items-center gap-1.5 text-green-500" title={`Image Circle (${imageCircle}mm) covers Sensor (${sensorDiagonal?.toFixed(2)}mm)`}>
                <CheckCircle2 className="w-4 h-4" />
                {!compact && (
                    <span className="text-sm font-medium">
                        Covers Sensor (+{diff?.toFixed(1)}mm)
                    </span>
                )}
            </div>
        );
    }

    if (status === 'vignettes') {
        return (
            <div className="flex items-center gap-1.5 text-red-500" title={`Image Circle (${imageCircle}mm) is smaller than Sensor (${sensorDiagonal?.toFixed(2)}mm)`}>
                <AlertCircle className="w-4 h-4" />
                {!compact && (
                    <span className="text-sm font-medium">
                        Vignettes ({diff?.toFixed(1)}mm)
                    </span>
                )}
            </div>
        );
    }

    return null;
}
