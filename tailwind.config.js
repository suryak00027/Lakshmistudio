/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        // Teal/emerald accent system — NOT blue
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Keep gold/warm/ink as aliases for backward compat with any remaining references
        gold: {
          50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4',
          400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E',
          800: '#115E59', 900: '#134E4A',
        },
        warm: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B',
        },
        ink: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8',
          500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,23,42,0.04), 0 1px 2px -1px rgba(15,23,42,0.02)',
        'card-hover': '0 12px 32px -8px rgba(20,184,166,0.12), 0 4px 12px -4px rgba(15,23,42,0.06)',
        'glow': '0 0 0 1px rgba(20,184,166,0.08), 0 6px 24px -4px rgba(20,184,166,0.20)',
        'btn': '0 1px 2px 0 rgba(20,184,166,0.18)',
        'glow-lg': '0 0 24px -2px rgba(20,184,166,0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        'gradient-accent': 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 50%, #0D9488 100%)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'count-up': 'count-up 0.5s ease-out both',
        'shimmer': 'shimmer 1.5s infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rotate-in': 'rotate-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        'fade-in-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.95) translateY(8px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        'slide-in-right': { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'slide-in-left': { from: { opacity: '0', transform: 'translateX(-100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'count-up': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'glow-pulse': { '0%, 100%': { boxShadow: '0 0 8px -2px rgba(20,184,166,0.15)' }, '50%': { boxShadow: '0 0 24px -2px rgba(20,184,166,0.30)' } },
        'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'rotate-in': { from: { opacity: '0', transform: 'rotate(-3deg) scale(0.95)' }, to: { opacity: '1', transform: 'rotate(0deg) scale(1)' } },
      },
    },
  },
  plugins: [],
};
