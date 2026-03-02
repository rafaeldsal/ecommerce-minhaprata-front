const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,ts,js,tsx,jsx,scss}",
  ],
  theme: {
    extend: {
      // ========== CORES ==========
      colors: {
        // Primárias (seu tema azul/turquesa)
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#22a6b3", // sua cor principal
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          DEFAULT: "#22a6b3",
          dark: "#05535a",
          light: "#22a6b3",
        },

        // Secundárias (roxo)
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#8b5cf6", // sua cor secundária
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#8b5cf6",
          dark: "#7c3aed",
          light: "#a78bfa",
        },

        // Neutras (seu sistema de cinza)
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },

        green: {
          50: "#f0fdf4",
          200: "#bbf7d0",
          600: "#16a34a",
          800: "#166534",
        },
        red: {
          50: "#fef2f2",
          200: "#fecaca",
          600: "#dc2626",
          800: "#991b1b",
        },
        amber: {
          50: "#fffbeb",
          200: "#fde68a",
          600: "#d97706",
          800: "#92400e",
        },
        blue: {
          50: "#eff6ff",
          200: "#bfdbfe",
          600: "#2563eb",
          800: "#1e40af",
        },
        slate: {
          50: "#f8fafc",
          200: "#e2e8f0",
          500: "#64748b",
          600: "#475569",
        },

        // Semânticas
        success: {
          DEFAULT: "#10b981",
          light: "#f0fdf4",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fffbeb",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
        },
        info: {
          DEFAULT: "#3b82f6",
        },

        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
        },

        // Cores base
        white: "#ffffff",
        black: "#000000",
      },

      // ========== TIPOGRAFIA ==========
      fontFamily: {
        primary: [
          "Inter",
          "Segoe UI",
          "Tahoma",
          "Geneva",
          "Verdana",
          "sans-serif",
        ],
        secondary: ["Georgia", "serif"],
      },

      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
      },

      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      lineHeight: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.75",
      },

      // ========== ESPAÇAMENTOS ==========
      spacing: {
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        5: "1.25rem", // 20px
        6: "1.5rem", // 24px
        8: "2rem", // 32px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
        16: "4rem", // 64px
      },

      // ========== BORDER RADIUS ==========
      borderRadius: {
        sm: "0.25rem",
        base: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },

      // ========== BOX SHADOW ==========
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },

      // ========== Z-INDEX ==========
      zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        "modal-backdrop": 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
      },

      // ========== BREAKPOINTS ==========
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      animation: {
        "spin-slow": "spin 1s linear infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "pulse-soft": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      // ========== KEYFRAMES ==========
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },

      // ========== TRANSITIONS ==========
      transitionProperty: {
        colors:
          "color, background-color, border-color, text-decoration-color, fill, stroke",
        transform: "transform",
      },
      transitionDuration: {
        300: "300ms",
        500: "500ms",
      },
    },
  },
  plugins: [],
  // ========== DARK MODE ==========
  darkMode: "false", // ou 'media' para seguir preferência do sistema
};
