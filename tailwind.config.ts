import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "ink-blue": "#1E3A5F",
        amber: "#B45309",
        parchment: "#FEFDFB",
        navy: "#0F172A",
        "ink-blue-light": "#2A5080",
        "amber-light": "#D97706",
        "amber-pale": "#FEF3C7",
        "parchment-dark": "#F5F0E8",
        "ink-muted": "#4A6580",
      },
      fontFamily: {
        serif: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        reading: "900px",
        dashboard: "1200px",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(30, 58, 95, 0.08)",
        card: "0 4px 20px rgba(30, 58, 95, 0.10)",
        hover: "0 8px 30px rgba(30, 58, 95, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
