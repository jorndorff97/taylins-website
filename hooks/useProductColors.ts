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

// Helper to check if a color is vibrant enough
function isVibrantColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Color must have reasonable saturation and not be too light or too dark
  return s > 15 && l > 20 && l < 80;
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

    // Create a canvas to analyze different regions
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(img, 0, 0);

    // Extract colors from different regions of the image
    const colors: Array<{ hex: string; saturation: number; lightness: number }> = [];
    
    // Analyze top third
    const topColor = await fac.getColorAsync(img, {
      algorithm: 'dominant',
      top: 0,
      height: Math.floor(img.height / 3),
      ignoredColor: [[255, 255, 255, 255, 50]],
    });
    
    // Analyze middle third
    const midColor = await fac.getColorAsync(img, {
      algorithm: 'dominant',
      top: Math.floor(img.height / 3),
      height: Math.floor(img.height / 3),
      ignoredColor: [[255, 255, 255, 255, 50]],
    });
    
    // Analyze bottom third
    const bottomColor = await fac.getColorAsync(img, {
      algorithm: 'dominant',
      top: Math.floor((img.height * 2) / 3),
      height: Math.ceil(img.height / 3),
      ignoredColor: [[255, 255, 255, 255, 50]],
    });
    
    // Also get overall dominant color as backup
    const overallColor = await fac.getColorAsync(img, {
      algorithm: 'dominant',
      ignoredColor: [[255, 255, 255, 255, 50]],
    });

    // Collect all colors with their properties
    const allColors = [topColor, midColor, bottomColor, overallColor];
    
    console.log('Extracted colors from regions:', allColors.map(c => c.hex));
    
    for (const color of allColors) {
      const r = color.value[0];
      const g = color.value[1];
      const b = color.value[2];
      const [h, s, l] = rgbToHsl(r, g, b);
      
      if (isVibrantColor(color.hex)) {
        colors.push({ hex: color.hex, saturation: s, lightness: l });
      }
    }
    
    // Remove duplicate colors (similar colors)
    const uniqueColors: Array<{ hex: string; saturation: number; lightness: number }> = [];
    for (const color of colors) {
      const isDuplicate = uniqueColors.some(existing => {
        const r1 = parseInt(color.hex.slice(1, 3), 16);
        const g1 = parseInt(color.hex.slice(3, 5), 16);
        const b1 = parseInt(color.hex.slice(5, 7), 16);
        const r2 = parseInt(existing.hex.slice(1, 3), 16);
        const g2 = parseInt(existing.hex.slice(3, 5), 16);
        const b2 = parseInt(existing.hex.slice(5, 7), 16);
        
        // Colors are similar if all RGB values are within 30 of each other
        return Math.abs(r1 - r2) < 30 && Math.abs(g1 - g2) < 30 && Math.abs(b1 - b2) < 30;
      });
      
      if (!isDuplicate) {
        uniqueColors.push(color);
      }
    }
    
    // Sort by saturation (most vibrant first)
    uniqueColors.sort((a, b) => b.saturation - a.saturation);
    
    console.log('Unique vibrant colors:', uniqueColors.map(c => c.hex));
    
    let primaryColor: string;
    let secondaryColor: string;
    
    if (uniqueColors.length === 0) {
      // No vibrant colors found, use fallback
      console.warn('No vibrant colors found, using fallback red');
      primaryColor = lightenColor('#DC2626', 20);
      secondaryColor = lightenColor(primaryColor, 25);
    } else if (uniqueColors.length === 1) {
      // Only one vibrant color, use it and a lighter version
      primaryColor = lightenColor(uniqueColors[0].hex, 15);
      secondaryColor = lightenColor(primaryColor, 25);
    } else {
      // Multiple colors found, use the top 2
      // Lighten the primary color to reduce boldness
      primaryColor = lightenColor(uniqueColors[0].hex, 15);
      secondaryColor = uniqueColors[1].hex;
      
      // If secondary is too dark, lighten it more
      const secR = parseInt(secondaryColor.slice(1, 3), 16);
      const secG = parseInt(secondaryColor.slice(3, 5), 16);
      const secB = parseInt(secondaryColor.slice(5, 7), 16);
      const [secH, secS, secL] = rgbToHsl(secR, secG, secB);
      
      if (secL < 65) {
        secondaryColor = lightenColor(secondaryColor, 30);
      }
    }
    
    // Gradient always ends with white for readability
    const from = primaryColor;          // Lighter primary color for better readability
    const via = secondaryColor;          // Secondary color or lighter primary
    const to = '#FFFFFF';                // Pure white for text readability
    
    console.log('Final gradient colors:', { from, via, to });

    return { from, via, to };
  } catch (error) {
    console.error('Failed to extract colors:', error);
    // Fallback to subtle gradient ending in white
    return {
      from: '#F5F5F5',
      via: '#FAFAFA',
      to: '#FFFFFF',
    };
  } finally {
    fac.destroy();
  }
}
