import { EquipmentItem } from '@/types';

interface Dimensions {
    width: number;
    height: number;
    diagonal: number;
}

export function parseSensorDimensions(dimString?: string): Dimensions | null {
    if (!dimString) return null;

    // Matches "Width x Height" formats, allowing for spaces and optional "mm"
    // e.g. "36.70 x 25.54", "36 x 24mm"
    const regex = /([\d.]+)\s*[xX]\s*([\d.]+)/;
    const match = dimString.match(regex);

    if (!match) return null;

    const width = parseFloat(match[1]);
    const height = parseFloat(match[2]);

    if (isNaN(width) || isNaN(height)) return null;

    const diagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));

    return { width, height, diagonal };
}

export type CoverageStatus = 'covers' | 'vignettes' | 'unknown' | 'exact';

export function checkLensCoverage(lens: EquipmentItem, camera: EquipmentItem): { status: CoverageStatus; diff: number } {
    if (lens.category !== 'Lens' || camera.category !== 'Camera') {
        return { status: 'unknown', diff: 0 };
    }

    const sensorDims = parseSensorDimensions(camera.specs.sensor_size);
    const imageCircle = lens.specs.image_circle_mm;

    if (!sensorDims || !imageCircle) {
        return { status: 'unknown', diff: 0 };
    }

    const diff = imageCircle - sensorDims.diagonal;

    // Tolerance of 0.5mm for "exact" matches or negligible differences
    if (diff >= 0) {
        return { status: 'covers', diff };
    } else if (Math.abs(diff) < 1.0) {
        // If it's borderline (within 1mm), we might consider it "exact/usable" but technically it might vignette slightly.
        // Let's call it 'vignettes' but the UI can interpret slight vignettes differently if needed.
        // Actually, for professional use, even 0.1mm shortage is a vignette.
        // Let's stick to strict logical comparison.
        return { status: 'vignettes', diff };
    } else {
        return { status: 'vignettes', diff };
    }
}

export function formatDiagonal(num: number): string {
    return num.toFixed(2) + 'mm';
}
