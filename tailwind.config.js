const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, './pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './app/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './lib/**/*.{js,ts,jsx,tsx,mdx}'), // Added lib directory
  ],
  theme: {
    extend: {
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Brand Colors
        'brand-charcoal': '#334155',
        'brand-bg-light': '#f0f4f8',
        'brand-accent-blue': '#2563eb',
        'brand-accent-green': '#10b981',
        'brand-accent-purple': '#8b5cf6',
        'brand-accent-red': '#ef4444',
      },
    },
  },
  plugins: [],
}
