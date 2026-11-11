/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F6F5F0',
        'soft-white': '#FFFFFF',
        forest: {
          DEFAULT: '#203B32',
          dark: '#192A25',
          hover: '#1A3028',
          light: '#EEF2EF',
        },
        sage: {
          DEFAULT: '#82998B',
          muted: '#A3B5AA',
        },
        champagne: {
          DEFAULT: '#C6AD83',
          soft: '#F5EFE4',
          dark: '#A48C63',
        },
        charcoal: '#252B29',
        'muted-grey': '#777F79',
        'warm-border': '#E7E5DD',
        success: {
          DEFAULT: '#54836B',
          bg: '#EDF4F0',
        },
        warning: {
          DEFAULT: '#B58B4F',
          bg: '#F8F2E8',
        },
        error: {
          DEFAULT: '#B7655F',
          bg: '#F8ECEB',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        btn: '9px',
        card: '12px',
        'card-lg': '16px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(25, 42, 37, 0.04), 0 1px 2px rgba(25, 42, 37, 0.03)',
        card: '0 4px 16px rgba(25, 42, 37, 0.05), 0 1px 3px rgba(25, 42, 37, 0.03)',
        elevated: '0 12px 32px rgba(25, 42, 37, 0.08), 0 2px 6px rgba(25, 42, 37, 0.04)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ambient-pan': {
          '0%': { transform: 'scale(1.03) translate3d(0, 0, 0)' },
          '50%': { transform: 'scale(1.07) translate3d(-1.2%, -0.8%, 0)' },
          '100%': { transform: 'scale(1.03) translate3d(0, 0, 0)' },
        },
      },
      animation: {
        ticker: 'ticker 45s linear infinite',
        'ambient-pan': 'ambient-pan 22s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

