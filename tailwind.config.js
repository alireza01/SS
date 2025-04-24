/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        gold: {
          '50': '#fff9eb',
          '100': '#fef2d6',
          '200': '#fce4ad',
          '300': '#fad584',
          '400': '#f7c65b',
          '500': '#f4b732',
          '600': '#da9917',
          '700': '#b57714',
          '800': '#905c11',
          '900': '#744a0e',
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "zoom-in": {
          from: { transform: "scale(0.95)" },
          to: { transform: "scale(1)" },
        },
        "slide-in": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-50": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "zoom-in-90": "zoom-in 0.2s ease-out",
      },
      transformStyle: {
        "3d": "preserve-3d",
      },
      backfaceVisibility: {
        hidden: "hidden",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    function({ addUtilities }) {
      addUtilities({
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.from-gold-50': { 'from': '#fff9eb' },
        '.to-gold-50': { 'to': '#fff9eb' },
        '.from-gold-100': { 'from': '#fef2d6' },
        '.to-gold-100': { 'to': '#fef2d6' },
        '.from-gold-200': { 'from': '#fce4ad' },
        '.to-gold-200': { 'to': '#fce4ad' },
        '.from-gold-300': { 'from': '#fad584' },
        '.to-gold-300': { 'to': '#fad584' },
        '.from-gold-400': { 'from': '#f7c65b' },
        '.to-gold-400': { 'to': '#f7c65b' },
        '.from-gold-600': { 'from': '#da9917' },
        '.to-gold-600': { 'to': '#da9917' },
        '.from-gold-200\/20': { 'from': 'rgb(252 228 173 / 0.2)' },
        '.dark\\:from-gold-900\/20': { 'from': 'rgb(116 74 14 / 0.2)' },
        '.dark\\:to-background': { 'to': 'hsl(var(--background))' },
        '.from-primary\\/10': { 'from': 'rgb(var(--primary) / 0.1)' },
        '.to-primary\\/5': { 'to': 'rgb(var(--primary) / 0.05)' },
      })
    }
  ],
} 