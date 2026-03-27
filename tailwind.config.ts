import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accent2: "rgb(var(--accent-2) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        premium: "0 18px 40px rgba(31, 41, 51, 0.08)",
        soft: "0 6px 18px rgba(31, 41, 51, 0.05)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 600ms ease-out",
        rise: "rise 500ms ease-out",
        celebrate: "celebrate 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        burst: "burst 650ms ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%": { transform: "scale(0.96)", opacity: "0.75" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        rise: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0px)", opacity: "1" },
        },
        celebrate: {
          "0%": { transform: "scale(0.98)", boxShadow: "0 0 0 rgba(111,175,143,0)" },
          "40%": { transform: "scale(1.02)", boxShadow: "0 18px 36px rgba(111,175,143,0.22)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(111,175,143,0)" },
        },
        burst: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "35%": { opacity: "0.9" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
