/** Calculates the absolute difference between angles in degrees
 * @returns An absolute difference from -180 to 180 degrees
 */
export function angleDiffDeg(angle1: number, angle2: number) {
    angle1 = ((angle1 % 360) + 360) % 360;
    angle2 = ((angle2 % 360) + 360) % 360;

    const diff = ((angle2 - angle1 + 180) % 360) - 180;
    return diff + (diff < -180 ? 360 : 0);
}

/** Calculates the absolute difference between angles in radians
 * @returns An absolute difference from -π to π
 */
export function angleDiff(angle1: number, angle2: number) {
    const _2_PI = 2 * Math.PI;

    angle1 = ((angle1 % _2_PI) + _2_PI) % _2_PI;
    angle2 = ((angle2 % _2_PI) + _2_PI) % _2_PI;

    const diff = ((angle2 - angle1 + Math.PI) % _2_PI) - Math.PI;
    return diff + (diff < -Math.PI ? _2_PI : 0);
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function linInt(
    currentValue: number,
    lowerBorder: number,
    higherBorder: number,
    interpolatedLower = 0,
    interpolatedHigher = 1
) {
    const clampedValue = clamp(currentValue, lowerBorder, higherBorder);

    const interpolationFactor = (clampedValue - lowerBorder) / (higherBorder - lowerBorder);
    const interpolatedValue =
        interpolatedLower + interpolationFactor * (interpolatedHigher - interpolatedLower);

    if (isNaN(interpolatedValue)) {
        return higherBorder;
    }

    return interpolatedValue;
}

export function radToDeg(radians: number) {
    return radians * (180 / Math.PI);
}

export function degToRad(degrees: number) {
    return degrees * (Math.PI / 180);
}
