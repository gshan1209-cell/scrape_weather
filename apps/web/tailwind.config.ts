import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        field: { DEFAULT: "#2f7d57", light: "#3d9b6c", dark: "#1f5c3d", 50: "#f0f7f3", 100: "#d4ebe0" },
        soil: { DEFAULT: "#7a5b3d", light: "#9b7552" },
        sun: { DEFAULT: "#f4b942", light: "#f7cc73", dark: "#e0a420" },
        water: { DEFAULT: "#247ba0", light: "#3599c1" },
        sky: { DEFAULT: "#7ab8d4", light: "#a3d0e4" },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1f5c3d 0%, #2f7d57 40%, #3d9b6c 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(47,125,87,0.04) 0%, transparent 40%)",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)",
        elevated: "0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)",
        map: "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px -3px rgba(0,0,0,0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
