/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos PepsiCo
        primary: {
          DEFAULT: '#0057A8',
          50: '#E6F0FA',
          100: '#CCE1F5',
          200: '#99C3EB',
          300: '#66A5E1',
          400: '#3387D7',
          500: '#0057A8',
          600: '#004686',
          700: '#003465',
          800: '#002343',
          900: '#001122',
        },
        secondary: {
          DEFAULT: '#E32934',
          50: '#FCE8E9',
          100: '#F9D1D3',
          200: '#F3A3A7',
          300: '#ED757B',
          400: '#E7474F',
          500: '#E32934',
          600: '#B6212A',
          700: '#88191F',
          800: '#5B1115',
          900: '#2D080A',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}





