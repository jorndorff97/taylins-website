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

// Extract and adjust colors from image for gradient
export async function extractGradientColors(imageUrl: string): Promise<GradientColors> {
  const fac = new FastAverageColor();

  try {
    // Create image element
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
    });

    // Extract dominant color, ignoring white/near-white pixels
    const color = await fac.getColorAsync(img, {
      algorithm: 'dominant',
      ignoredColor: [
        [255, 255, 255, 255, 50], // Ignore pure white and near-white
      ],
    });
    
    console.log('Extracted color:', color.hex, color.rgb);
    
    // Get hex color
    let baseColor = color.hex;
    
    // Check if extracted color is too light/desaturated (likely white background)
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    const [h, s, l] = rgbToHsl(r, g, b);
    
    console.log('HSL values:', { h, s, l });
    
    // If saturation is too low or lightness too high, it's probably white background
    if (s < 15 || l > 85) {
      console.warn('Color too desaturated/light, using fallback red');
      // Use a nice default red from the shoe brand
      baseColor = '#DC2626';
    }

    // Adjust color for better background aesthetics
    // First saturate to make it more vibrant
    baseColor = saturateColor(baseColor, 15);
    
    // Then create gradient by lightening
    const from = lightenColor(baseColor, 40);  // Lightest
    const via = lightenColor(baseColor, 25);   // Mid
    const to = lightenColor(baseColor, 15);    // Base adjusted
    
    console.log('Final gradient:', { from, via, to });

    return { from, via, to };
  } catch (error) {
    console.error('Failed to extract colors:', error);
    // Fallback to white gradient
    return {
      from: '#FFFFFF',
      via: '#F5F5F5',
      to: '#E5E5E5',
    };
  } finally {
    fac.destroy();
  }
}
