/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'pulse-once': 'pulseScale 1s ease-in-out',
        'bounce-in': 'bounceIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        bounceIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3) translate3d(0, 0, 0)' 
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)' 
          },
          '70%': { 
            transform: 'scale(0.9)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translate3d(0, 0, 0)' 
          },
        },
      },
    },
  },
  plugins: [],
}
