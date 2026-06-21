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
        substrate: "rgb(var(--substrate) / <alpha-value>)",
        "substrate-raised": "rgb(var(--substrate-raised) / <alpha-value>)",
        copper: "rgb(var(--copper) / <alpha-value>)",
        "copper-dim": "rgb(var(--copper-dim) / <alpha-value>)",
        signal: "rgb(var(--signal) / <alpha-value>)",
        alert: "rgb(var(--alert) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-dim": "rgb(var(--ink-dim) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
} satisfies Config;
