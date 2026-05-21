import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#06080f",
          900: "#0a0e1a",
          800: "#0f172a",
        },
        accent: {
          DEFAULT: "#818cf8",
          deep: "#6366f1",
          violet: "#a78bfa",
          fuchsia: "#f0abfc",
        },
        signal: {
          green: "#34d399",
          amber: "#fbbf24",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #818cf8, #a78bfa, #f0abfc)",
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(129,140,248,0.12), transparent 60%)",
      },
      boxShadow: {
        glass: "0 16px 48px -8px rgba(0,0,0,0.45)",
        "glass-light": "0 12px 32px -6px rgba(15,23,42,0.08)",
        glow: "0 0 40px -8px rgba(129,140,248,0.55)",
      },
      keyframes: {
        drift1: { to: { transform: "translate(-60px,50px) scale(1.08)" } },
        drift2: { to: { transform: "translate(80px,-60px) scale(0.94)" } },
        drift3: { to: { transform: "translate(-40px,-35px) scale(1.12)" } },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        kenburns: {
          "0%": { transform: "scale(1) translate(0,0)" },
          "100%": { transform: "scale(1.15) translate(-2%,-2%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.5" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        drift1: "drift1 22s ease-in-out infinite alternate",
        drift2: "drift2 28s ease-in-out infinite alternate",
        drift3: "drift3 18s ease-in-out infinite alternate",
        shimmer: "shimmer 8s linear infinite",
        kenburns: "kenburns 20s ease-in-out infinite alternate",
        "pulse-ring": "pulse-ring 3s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
