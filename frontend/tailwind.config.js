/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canifa-inspired color palette
        primary: {
          50: '#fef7f0',
          100: '#fdebd9',
          200: '#fad4b1',
          300: '#f6b580',
          400: '#f18d4d',
          500: '#ed6d28', // Main primary - warm orange
          600: '#de531d',
          700: '#b83e19',
          800: '#93331c',
          900: '#772c1a',
        },
        secondary: {
          50: '#f8f7f4',
          100: '#efede6',
          200: '#ddd9cc',
          300: '#c7c0ab',
          400: '#afa388',
          500: '#9d8d6e', // Earthy tone
          600: '#907d5f',
          700: '#786650',
          800: '#635445',
          900: '#52463b',
        },
        dark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#1a1a1a', // Deep black for text
        },
        cream: '#faf8f5',
        sand: '#f5f0e8',
      },
      fontFamily: {
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

