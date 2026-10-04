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
        noon: {
          50: '#FDF8F3',
          100: '#FBEEDF',
          200: '#F7D9BF',
          300: '#F1BA93',
          400: '#EA9260',
          500: '#E26D34', // warm terracotta / roasted spice
          600: '#D15021',
          700: '#AD3B19',
          800: '#8A3019',
          900: '#702917',
          gold: '#E5A93C', // golden warm glow
          goldHover: '#D49528',
          dark: '#141416', // cafe dark background
          card: '#1C1C20', // cafe card background
          cardElevated: '#24242A',
          border: '#2C2C34',
          cream: '#FFF9F2',
          halal: '#10B981', // green halal badge
        }
      },
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'Traditional Arabic', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
