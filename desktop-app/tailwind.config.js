/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0c',
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'accent-gold': '#d4af37',
        'accent-blue': '#3b82f6',
        'primary-orange': '#ec5b13',
        'success-green': '#10b981',
        'error-red': '#ef4444'
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.6))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))' },
        }
      }
    },
  },
  plugins: [],
};


