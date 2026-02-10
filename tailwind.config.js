/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f3f4f6", // page bg
        card: "#ffffff",
        accent: {
          DEFAULT: "#22c55e", // primary accent
          muted: "#bbf7d0",
        },
        hero: {
          bg: "#f8fafc",
          accent: "#7c3aed", // purple for storefront hero (Legend-inspired)
        },
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(15, 23, 42, 0.07)",
      },
    },
  },
  plugins: [],
};
