"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { 
  shouldUseDarkText, 
  getAdaptiveTextColors, 
  tintColor, 
  alphaBlend 
} from "@/lib/colorUtils";

interface GradientColors {
  from: string;
  via: string;
  to: string;
}

interface ThemeColors {
  // Original gradient colors
  from: string;
  via: string;
  to: string;
  
  // Derived theme colors for sections
  primaryAccent: string;      // Main accent color (from product)
  secondaryAccent: string;    // Secondary accent (via color)
  backgroundTint: string;     // Light tint for section backgrounds
  cardBackground: string;     // Card background with subtle tint
  textPrimary: string;        // Adaptive text color (dark/light)
  textSecondary: string;      // Adaptive secondary text
  borderColor: string;        // Border color matching theme
}

interface BackgroundColorContextType {
  colors: GradientColors;
  themeColors: ThemeColors;
  setColors: (colors: GradientColors) => void;
}

/**
 * Derive theme colors from gradient colors for use in themed sections
 */
function deriveThemeColors(colors: GradientColors): ThemeColors {
  const { from, via, to } = colors;
  
  // Create subtle tints for backgrounds (15% opacity)
  const backgroundTint = alphaBlend(from, 0.15);
  const cardBackground = alphaBlend(from, 0.08);
  
  // Get adaptive text colors based on background tint
  const textColors = getAdaptiveTextColors(backgroundTint);
  
  // Create border color (slightly more saturated than background)
  const borderColor = alphaBlend(from, 0.12);
  
  return {
    from,
    via,
    to,
    primaryAccent: from,
    secondaryAccent: via,
    backgroundTint,
    cardBackground,
    textPrimary: textColors.primary,
    textSecondary: textColors.secondary,
    borderColor,
  };
}

const BackgroundColorContext = createContext<BackgroundColorContextType | undefined>(undefined);

export function BackgroundColorProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<GradientColors>({
    from: '#FFFFFF',
    via: '#F5F5F5',
    to: '#E5E5E5',
  });

  // Derive theme colors whenever gradient colors change
  const themeColors = useMemo(() => deriveThemeColors(colors), [colors]);

  return (
    <BackgroundColorContext.Provider value={{ colors, themeColors, setColors }}>
      {children}
    </BackgroundColorContext.Provider>
  );
}

export function useBackgroundColors() {
  const context = useContext(BackgroundColorContext);
  if (context === undefined) {
    throw new Error('useBackgroundColors must be used within a BackgroundColorProvider');
  }
  return context;
}
