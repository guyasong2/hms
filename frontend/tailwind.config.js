/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef7ff',
          100: '#d9ecff',
          200: '#bbddff',
          300: '#8ec7ff',
          400: '#5aa6ff',
          500: '#3484fc',
          600: '#1e62f1',
          700: '#164dde',
          800: '#1840b4',
          900: '#193a8e',
          950: '#132357',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: { DEFAULT: '#16a34a', light: '#dcfce7' },
        warning: { DEFAULT: '#d97706', light: '#fef3c7' },
        danger:  { DEFAULT: '#dc2626', light: '#fee2e2' },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        modal: '0 20px 60px rgb(0 0 0 / 0.15)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
