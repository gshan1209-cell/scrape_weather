import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        field: "#2f7d57",
        soil: "#7a5b3d",
        sun: "#f4b942",
        water: "#247ba0",
      },
    },
  },
  plugins: [],
};

export default config;
