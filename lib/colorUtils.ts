/**
 * Color utility functions for WCAG contrast, color blending, and adaptive theming
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Calculate relative luminance according to WCAG standards
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function calculateLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  
  // Convert to 0-1 range
  const [rs, gs, bs] = [r, g, b].map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if dark text should be used on a background color
 * Returns true if dark text provides better contrast
 */
export function shouldUseDarkText(backgroundColor: string): boolean {
  const luminance = calculateLuminance(backgroundColor);
  // If background is light (luminance > 0.5), use dark text
  return luminance > 0.5;
}

/**
 * Blend a tint color over a base color with specified opacity
 */
export function tintColor(baseColor: string, tintColor: string, opacity: number): string {
  const base = hexToRgb(baseColor);
  const tint = hexToRgb(tintColor);
  
  const blended = {
    r: Math.round(base.r * (1 - opacity) + tint.r * opacity),
    g: Math.round(base.g * (1 - opacity) + tint.g * opacity),
    b: Math.round(base.b * (1 - opacity) + tint.b * opacity),
  };
  
  return rgbToHex(blended.r, blended.g, blended.b);
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  
  const lighten = (val: number) => {
    return Math.min(255, Math.round(val + (255 - val) * (percent / 100)));
  };
  
  return rgbToHex(lighten(r), lighten(g), lighten(b));
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  
  const darken = (val: number) => {
    return Math.max(0, Math.round(val * (1 - percent / 100)));
  };
  
  return rgbToHex(darken(r), darken(g), darken(b));
}

/**
 * Ensure a text color has sufficient contrast against a background
 * Adjusts the text color if needed to meet WCAG standards
 */
export function ensureContrast(
  textColor: string,
  backgroundColor: string,
  minRatio: number = 4.5
): string {
  let currentTextColor = textColor;
  const ratio = getContrastRatio(currentTextColor, backgroundColor);
  
  if (ratio >= minRatio) {
    return currentTextColor;
  }
  
  // Try lightening or darkening the text color
  const shouldLighten = !shouldUseDarkText(backgroundColor);
  
  let adjustedColor = currentTextColor;
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    if (shouldLighten) {
      adjustedColor = lightenColor(adjustedColor, 5);
    } else {
      adjustedColor = darkenColor(adjustedColor, 5);
    }
    
    const newRatio = getContrastRatio(adjustedColor, backgroundColor);
    if (newRatio >= minRatio) {
      return adjustedColor;
    }
    
    attempts++;
  }
  
  // If we can't achieve the contrast, return pure black or white
  return shouldUseDarkText(backgroundColor) ? '#000000' : '#FFFFFF';
}

/**
 * Get adaptive text colors based on background
 */
export function getAdaptiveTextColors(backgroundColor: string): {
  primary: string;
  secondary: string;
} {
  const useDark = shouldUseDarkText(backgroundColor);
  
  if (useDark) {
    return {
      primary: ensureContrast('#1e293b', backgroundColor, 4.5), // slate-900
      secondary: ensureContrast('#475569', backgroundColor, 4.5), // slate-600
    };
  } else {
    return {
      primary: ensureContrast('#f8fafc', backgroundColor, 4.5), // slate-50
      secondary: ensureContrast('#cbd5e1', backgroundColor, 4.5), // slate-300
    };
  }
}

/**
 * Create an alpha-blended color (color with transparency over white)
 */
export function alphaBlend(color: string, alpha: number): string {
  return tintColor('#FFFFFF', color, alpha);
}
