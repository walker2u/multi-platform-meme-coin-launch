import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: "#12141F",
        "surface-light": "#1A1D2D",
        primary: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          glow: "rgba(99, 102, 241, 0.35)",
        },
        accent: {
          solana: "#14F195",
          base: "#0052FF",
          bnb: "#F3BA2F",
          pump: "#58E28D",
          purple: "#9945FF",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "crypto-gradient": "linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(26, 29, 45, 0.8) 0%, rgba(18, 20, 31, 0.9) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glowPulse: {
          "0%": { boxShadow: "0 0 15px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
