/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fafafa",
        card: "#ffffff",
        accent: {
          DEFAULT: "#22c55e",
          muted: "#bbf7d0",
        },
        hero: {
          bg: "#fafafa",
          accent: "#ef4444",
          secondary: "#dc2626",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.7)",
          border: "rgba(255, 255, 255, 0.2)",
        },
        brand: "#0f172a",
        neon: {
          purple: "#ef4444",
          pink: "#f87171",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          green: "#10b981",
        },
        glow: {
          purple: "rgba(239, 68, 68, 0.5)",
          pink: "rgba(248, 113, 113, 0.5)",
          blue: "rgba(59, 130, 246, 0.5)",
        },
        neutral: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
        sage: {
          light: "#e8ede8",
          DEFAULT: "#a4b5a4",
          dark: "#6b7c6b",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 16px rgba(15, 23, 42, 0.04)",
        xs: "0 1px 2px rgba(15, 23, 42, 0.05)",
      },
      keyframes: {
        "scroll-vertical": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "scroll-horizontal": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "scroll-vertical": "scroll-vertical 20s linear infinite",
        "scroll-horizontal": "scroll-horizontal 12s linear infinite",
      },
    },
  },
  plugins: [],
};
