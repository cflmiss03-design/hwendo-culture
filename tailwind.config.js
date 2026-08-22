/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
    "./components/**/*.{astro,html,js,jsx,ts,tsx}",
    "./layouts/**/*.{astro,html,js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      /* =========================
         PREMIUM COLOR PALETTE
      ========================== */
      colors: {
        // Primary : ROUGE SOMBRE (couleur dominante du Festival Hwendo-Culture)
        primary: {
          50: "#fdf2f2",
          100: "#fbe0e1",
          200: "#f5bcbe",
          300: "#e88b8e",
          400: "#d65a5f",
          500: "#b7333b",
          600: "#96222a",
          700: "#7a1820",
          800: "#5c1017",
          900: "#3d0a0f",
          950: "#240509",
        },
        // Secondary : OR ROYAL (accent, patrimoine du Bénin)
        secondary: {
          50: "#fffef0",
          100: "#fffddb",
          200: "#fff9b7",
          300: "#fff593",
          400: "#ffe871",
          500: "#D4AF37",
          600: "#C9A227",
          700: "#B8941F",
          800: "#996E1F",
          900: "#755300",
          950: "#4d3300",
        },
        // Success
        success: {
          50: "#f0fdf4",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        // Warning
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // Danger
        danger: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Neutral
        dark: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },

      /* =========================
         TYPOGRAPHY
      ========================== */
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "3.5rem" }],
        "6xl": ["3.75rem", { lineHeight: "4.5rem" }],
      },

      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },

      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },

      /* =========================
         SHADOWS (PREMIUM)
      ========================== */
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        xl: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        soft: "0 10px 30px rgba(0, 0, 0, 0.08)",
        medium: "0 15px 40px rgba(0, 0, 0, 0.12)",
        strong: "0 20px 50px rgba(0, 0, 0, 0.15)",
        premium: "0 30px 60px rgba(0, 0, 0, 0.18)",
        "glow-primary": "0 0 30px rgba(93, 104, 255, 0.3)",
        "glow-secondary": "0 0 30px rgba(255, 184, 51, 0.3)",
      },

      /* =========================
         BORDER RADIUS
      ========================== */
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        base: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        full: "9999px",
      },

      /* =========================
         ANIMATIONS & TRANSITIONS
      ========================== */
      animation: {
        // Fade animations
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-out": "fadeOut 0.4s ease-in",
        "fade-up": "fadeUp 0.6s ease-out",
        "fade-down": "fadeDown 0.6s ease-out",
        "fade-left": "fadeLeft 0.6s ease-out",
        "fade-right": "fadeRight 0.6s ease-out",

        // Scale animations
        "scale-up": "scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-down": "scaleDown 0.3s ease-in",

        // Slide animations
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-left": "slideLeft 0.5s ease-out",
        "slide-right": "slideRight 0.5s ease-out",

        // Pulse animations
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",

        // Shimmer
        shimmer: "shimmer 2s infinite",

        // Bounce
        "bounce-slow": "bounceSlow 3s ease-in-out infinite",

        // Rotate (for spinners)
        "spin-slow": "spin 3s linear infinite",

        // Floating
        float: "floatAnimation 4s ease-in-out infinite",

        // Color change
        "color-shift": "colorShift 5s ease-in-out infinite",

        // Ping (for alerts)
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeLeft: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },

        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        scaleDown: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },

        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },

        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(93, 104, 255, 0.5)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 0 10px rgba(93, 104, 255, 0)" },
        },

        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },

        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },

        floatAnimation: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },

        colorShift: {
          "0%, 100%": { color: "rgb(93, 104, 255)" },
          "50%": { color: "rgb(255, 184, 51)" },
        },

        ping: {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
      },

      transitionDuration: {
        150: "150ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        snappy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      /* =========================
         GRADIENTS
      ========================== */
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #7a1820 0%, #3d0a0f 100%)",
        "gradient-primary-light": "linear-gradient(135deg, #e88b8e 0%, #d65a5f 100%)",
        "gradient-secondary": "linear-gradient(135deg, #D4AF37 0%, #ffe871 100%)",
        "gradient-danger": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        "gradient-success": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-warning": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-dark": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        "shimmer-light": "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
      },

      /* =========================
         SPACING
      ========================== */
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
        "3xl": "6rem",
      },

      /* =========================
         Z-INDEX
      ========================== */
      zIndex: {
        auto: "auto",
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        base: "100",
        modal: "1000",
        dropdown: "500",
        sticky: "20",
        fixed: "1000",
        toast: "9999",
        spinner: "9998",
      },

      /* =========================
         ASPECT RATIO
      ========================== */
      aspectRatio: {
        auto: "auto",
        square: "1 / 1",
        video: "16 / 9",
        "3/2": "3 / 2",
        "4/3": "4 / 3",
      },

      /* =========================
         BACKDROP
      ========================== */
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        base: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
      },

      /* =========================
         OPACITY
      ========================== */
      opacity: {
        0: "0",
        5: "0.05",
        10: "0.1",
        20: "0.2",
        25: "0.25",
        30: "0.3",
        40: "0.4",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        75: "0.75",
        80: "0.8",
        90: "0.9",
        95: "0.95",
        100: "1",
      },
    },
  },

  plugins: [
    function ({ addVariant }) {
      addVariant("hover-primary", "&:hover");
      addVariant("group-hover", "&.group:hover > *");
      addVariant("dark-mode", "[data-theme='dark'] &");
    },
    // Styles "prose" pour le HTML riche des articles Actualité (voir
    // pages/actualites/lire.astro).
    require("@tailwindcss/typography"),
  ],
};
