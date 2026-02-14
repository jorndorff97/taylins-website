"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GradientColors {
  from: string;
  via: string;
  to: string;
}

interface BackgroundColorContextType {
  colors: GradientColors;
  setColors: (colors: GradientColors) => void;
}

const BackgroundColorContext = createContext<BackgroundColorContextType | undefined>(undefined);

export function BackgroundColorProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<GradientColors>({
    from: '#FFFFFF',
    via: '#F5F5F5',
    to: '#E5E5E5',
  });

  return (
    <BackgroundColorContext.Provider value={{ colors, setColors }}>
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
