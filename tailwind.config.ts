import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fyn: {
          primary: {
            DEFAULT: "#01574F", // Official Deep Corporate Emerald
            dark: "#013F39",
            light: "#02756A",
            subtle: "#E6F0EE",
          },
          dark: {
            DEFAULT: "#142A2B", // Deep slate / forest background
            surface: "#1D3B3C",
          },
          accent: {
            DEFAULT: "#78BB69", // Sage / Growth Green accent
            dark: "#5E9B50",
            light: "#97CF8A",
            subtle: "#EFF7ED",
          },
          mint: {
            DEFAULT: "#6DB9A0",
            light: "#EAF6F2",
          },
          gold: {
            DEFAULT: "#C5A869", // Premium executive Gold accent
            dark: "#A3864A",
            light: "#DFC790",
            subtle: "#FAF6ED",
          },
          slate: {
            DEFAULT: "#0F172A",
            muted: "#475569",
            light: "#94A3B8",
            border: "#E2E8F0",
          },
          bg: {
            DEFAULT: "#F8FAFB",
            subtle: "#F0F4F4",
            card: "#FFFFFF",
          },
        },
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        fyn: "0 1px 3px 0 rgba(1, 87, 79, 0.05), 0 1px 2px -1px rgba(1, 87, 79, 0.05)",
        "fyn-md": "0 4px 6px -1px rgba(1, 87, 79, 0.08), 0 2px 4px -2px rgba(1, 87, 79, 0.08)",
        "fyn-lg": "0 10px 15px -3px rgba(1, 87, 79, 0.1), 0 4px 6px -4px rgba(1, 87, 79, 0.05)",
        "fyn-gold": "0 4px 14px 0 rgba(197, 168, 105, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
