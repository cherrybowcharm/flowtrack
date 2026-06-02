/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Lato'", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
        script: ["'Dancing Script'", "cursive"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        // ── Brand: dusty rose / rose-pink ──────────────────────────────
        brand: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d8",
          300: "#f4a8b8",
          400: "#ec7590",
          500: "#d4526e",   // primary dusty rose
          600: "#b8385a",
          700: "#962b48",
          800: "#7d2740",
          900: "#6b2439",
        },
        // ── Blush: soft pink backgrounds ───────────────────────────────
        blush: {
          50: "#fff5f7",
          100: "#ffe8ed",
          200: "#ffd1db",
          300: "#ffb3c4",
          400: "#ff8fab",
          500: "#e8637e",
          600: "#c94d68",
          700: "#a83a54",
        },
        // ── Petal: lighter rose tones ───────────────────────────────────
        petal: {
          50: "#fdf6f7",
          100: "#faeef0",
          200: "#f5dde1",
          300: "#edc4cb",
          400: "#e0a3ae",
          500: "#c97e8d",
        },
        // ── Mauve: muted purple-rose ────────────────────────────────────
        mauve: {
          100: "#f5eef0",
          200: "#e8d5da",
          300: "#d4adb6",
          400: "#b8808e",
          500: "#9a5c6b",
          600: "#7d4456",
          700: "#622f42",
          800: "#4a2031",
          900: "#351422",
        },
        // ── Cream: warm ivory surfaces ──────────────────────────────────
        cream: {
          50: "#fffdf9",
          100: "#fdf8f0",
          200: "#f9efe0",
          300: "#f3e2cb",
          400: "#e8cfa8",
          500: "#d4b07a",
        },
        // ── Cocoa: chocolate brown accents ─────────────────────────────
        cocoa: {
          100: "#f5ede8",
          200: "#e8d0c5",
          300: "#d4ab98",
          400: "#b87e65",
          500: "#9a5a42",
          600: "#7d4232",
          700: "#623024",
          800: "#4a2018",
          900: "#2e1208",
        },
        // ── Surface: light mode neutrals (warm ivory tones) ────────────
        surface: {
          0: "#ffffff",
          50: "#fdf8f5",
          100: "#faf3ee",
          200: "#f4e8e0",
          300: "#e8d5ca",
          // dark mode surfaces (deep warm rose-brown)
          800: "#3d1e26",
          850: "#2e1520",
          900: "#221019",
          950: "#160b12",
        },
      },
      backgroundImage: {
        // Subtle stripe pattern for branding panel
        "stripe-light": "repeating-linear-gradient(135deg, transparent, transparent 20px, rgba(212,82,110,0.04) 20px, rgba(212,82,110,0.04) 40px)",
        "stripe-dark": "repeating-linear-gradient(135deg, transparent, transparent 20px, rgba(212,82,110,0.06) 20px, rgba(212,82,110,0.06) 40px)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.45s cubic-bezier(.16,1,.3,1) forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "tick": "tick 1s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        tick: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.04)" } },
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-6px)" } },
      },
      boxShadow: {
        "rose-sm": "0 1px 3px rgba(212,82,110,0.12), 0 1px 2px rgba(212,82,110,0.08)",
        "rose-md": "0 4px 16px rgba(212,82,110,0.15), 0 2px 4px rgba(212,82,110,0.08)",
        "rose-lg": "0 10px 40px rgba(212,82,110,0.18), 0 4px 12px rgba(212,82,110,0.1)",
        "cream-sm": "0 1px 3px rgba(156,103,70,0.1), 0 1px 2px rgba(156,103,70,0.06)",
        "cream-md": "0 4px 16px rgba(156,103,70,0.12), 0 2px 4px rgba(156,103,70,0.06)",
        "inner-rose": "inset 0 1px 3px rgba(212,82,110,0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
