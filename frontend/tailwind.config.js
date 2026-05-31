/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          0:   "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          800: "#1e293b",
          850: "#172033",
          900: "#0f172a",
          950: "#080f1e",
        },
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "tick":       "tick 1s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        tick:    { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.04)" } },
      },
    },
  },
  plugins: [],
};
