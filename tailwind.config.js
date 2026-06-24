/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          500: '#808080',
        },
        mansion: {
          red: '#EB1C24',
          gray: '#808080',
          chrome: 'rgba(200, 200, 200, 0.45)',
        },
        brand: {
          red: '#C81C24',
          'red-hover': '#E02030',
          gray: '#959B9B',
          charcoal: '#1A1A1A',
          white: '#FFFFFF',
          cream: '#FAF8F7',
          'cream-warm': '#FDF9F8',
        },
      },
      fontFamily: {
        futura: ['"Futura PT Medium"', '"Futura"', '"Century Gothic"', 'sans-serif'],
        'futura-book': ['"Futura PT Book"', '"Futura"', '"Century Gothic"', 'sans-serif'],
        grace: ['"Covered By Your Grace"', 'cursive'],
      },
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '32px',
      },
      animation: {
        'particle-drift': 'particleDrift 8s ease-in-out infinite',
        'rose-sway': 'roseSway 10s ease-in-out infinite',
        'pedestal-pulse': 'pedestalPulse 3s ease-in-out infinite',
        'shimmer-slide': 'shimmerSlide 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'unit-enter': 'unitEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'counter-roll': 'counterRoll 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        particleDrift: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-120px) translateX(20px)', opacity: '0' },
        },
        roseSway: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1.5deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1.5deg)' },
        },
        pedestalPulse: {
          '0%, 100%': { opacity: '0.7', transform: 'scaleX(1)' },
          '50%': { opacity: '1', transform: 'scaleX(1.05)' },
        },
        shimmerSlide: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        unitEnter: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        counterRoll: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {
        'desktop': '1440px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
    },
  },
  plugins: [],
}


