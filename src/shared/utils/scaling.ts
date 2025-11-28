import { moderateScale as rnModerateScale } from 'react-native-size-matters';

/**
 * Scaling utilities for responsive design with medium-level scaling
 *
 * Using higher moderateScale factors (0.5 instead of default 0.3)
 * to achieve less aggressive, medium-level scaling
 *
 * scale: Use for width, left, right, horizontal padding/margin
 * verticalScale: Use for height, top, bottom, vertical padding/margin
 * moderateScale: Use for font sizes, border radius with less aggressive scaling
 */

// Medium-level scaling with higher factor (0.5 instead of default 0.3)
// This makes scaling less aggressive - perfect for medium-sized displays
const MEDIUM_SCALE_FACTOR = 0.5;

/**
 * Medium-level scale for horizontal dimensions
 * Uses moderateScale with higher factor for less aggressive scaling
 */
export const scale = (size: number): number => {
  return rnModerateScale(size, MEDIUM_SCALE_FACTOR);
};

/**
 * Medium-level vertical scale for vertical dimensions
 * Uses moderateScale with higher factor for less aggressive scaling
 */
export const verticalScale = (size: number): number => {
  return rnModerateScale(size, MEDIUM_SCALE_FACTOR);
};

/**
 * Medium-level moderate scale for font sizes and border radius
 * Uses higher factor (0.5) for less aggressive scaling
 * Can optionally override with custom factor
 */
export const moderateScale = (
  size: number,
  factor: number = MEDIUM_SCALE_FACTOR,
): number => {
  return rnModerateScale(size, factor);
};

// Short aliases
export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
