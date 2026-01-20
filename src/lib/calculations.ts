/**
 * Parses a sensor size string (e.g. "36.70 x 25.54") and returns the diagonal in mm.
 * Returns 0 if invalid.
 */
export function getSensorDiagonal(sizeStr?: string): number {
    if (!sizeStr) return 0;

    // Normalize string (remove spaces)
    const normalized = sizeStr.toLowerCase().replace(/\s/g, '');
    // Split by 'x'
    const parts = normalized.split('x');
    if (parts.length !== 2) return 0;

    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);

    if (isNaN(w) || isNaN(h)) return 0;

    return Math.sqrt(w * w + h * h);
}

/**
 * Calculates generic Crop Factor relative to Full Frame (36x24mm -> 43.27mm diagonal).
 */
export function getCropFactor(sizeStr?: string): string {
    const diag = getSensorDiagonal(sizeStr);
    if (!diag) return 'N/A';

    const REFERENCE_DIAGONAL_FF = 43.27;
    const factor = REFERENCE_DIAGONAL_FF / diag;

    return factor.toFixed(2) + 'x';
}

/**
 * Checks if a Lens (image circle) covers a Camera (sensor diagonal).
 * Returns true if Compatible (Lens covers Sensor).
 * Returns false if Warning (Lens might vignette).
 */
export function checkCoverage(sensorSizeStr: string | undefined, lensImageCircle: number | undefined): boolean {
    if (!sensorSizeStr || !lensImageCircle) return true; // Cannot check, assume OK

    const sensorDiag = getSensorDiagonal(sensorSizeStr);
    // Allow a tiny margin of error (e.g. 0.5mm)
    return lensImageCircle >= (sensorDiag - 0.5);
}
