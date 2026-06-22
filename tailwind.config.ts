import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1C1941",
        cream: "#FDF8F5",
        purple: "#845EEB",
        mint: "#8AF2CF",
        rose: "#EF4A6B",
        gold: "#FFD166",
        lavender: "#E5D7FA",
        "violet-mid": "#A292E4",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        silkscreen: ['var(--font-silkscreen)', 'cursive'],
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "dot-pulse": "dot-pulse 1.5s ease-in-out infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
      },
    },
  },
} satisfies Config;
