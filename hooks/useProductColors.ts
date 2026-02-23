import { useEffect, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';

interface GradientColors {
  from: string;
  via: string;
  to: string;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Lighten color by increasing lightness
function lightenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  let [h, s, l] = rgbToHsl(r, g, b);

  // Increase lightness
  l = Math.min(100, l + percent);

  const [newR, newG, newB] = hslToRgb(h, s, l);
  return rgbToHex(newR, newG, newB);
}

// Saturate color by increasing saturation
function saturateColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  let [h, s, l] = rgbToHsl(r, g, b);

  // Increase saturation
  s = Math.min(100, s + percent);

  const [newR, newG, newB] = hslToRgb(h, s, l);
  return rgbToHex(newR, newG, newB);
}

// Helper to check if a color is usable (not pure white/black)
function isUsableColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Accept any color that's not pure white or pure black
  // Much more lenient than before
  return l > 5 && l < 95;
}

// Extract dominant color from image for a simple color-to-white gradient
export async function extractGradientColors(imageUrl: string): Promise<GradientColors> {
  const fac = new FastAverageColor();

  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
    });

    // Get the dominant color from the image
    const dominantColor = await fac.getColorAsync(img, {
      algorithm: 'dominant',
      ignoredColor: [[255, 255, 255, 255, 50]], // Ignore near-white
    });

    const r = dominantColor.value[0];
    const g = dominantColor.value[1];
    const b = dominantColor.value[2];
    const [h, s, l] = rgbToHsl(r, g, b);
    
    let primaryColor = dominantColor.hex;
    
    // Adjust the color to be suitable for a background
    if (l < 40) {
      // Too dark - lighten it significantly
      primaryColor = lightenColor(primaryColor, 35);
    } else if (l < 60) {
      // Moderately dark - lighten it a bit
      primaryColor = lightenColor(primaryColor, 20);
    } else if (l > 90) {
      // Too light/washed out - add some saturation and darken slightly
      primaryColor = saturateColor(primaryColor, 15);
    }
    
    // Create a midpoint color (lighter version of primary, blending toward white)
    const midColor = lightenColor(primaryColor, 25);
    
    // Simple gradient: primary color -> lighter midpoint -> white
    const from = primaryColor;
    const via = midColor;
    const to = '#FFFFFF';

    return { from, via, to };
  } catch (error) {
    console.error('Failed to extract colors:', error);
    return {
      from: '#F5F5F5',
      via: '#FAFAFA',
      to: '#FFFFFF',
    };
  } finally {
    fac.destroy();
  }
}
