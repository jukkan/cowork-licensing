/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette tuned to match the Dataverse Capacity Calculator look.
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bcd0ff',
          300: '#8eb0ff',
          400: '#5a85fb',
          500: '#3461f0',
          600: '#1f47d6',
          700: '#1b39ad',
          800: '#1c3389',
          900: '#1d306d',
        },
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)',
      },
    },
  },
  plugins: [],
}
