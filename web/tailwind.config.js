/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0B0F17',
          card: '#151D2C',
          cardHover: '#1C2638',
          border: '#222F44',
          subtle: '#0F1623'
        },
        light: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          cardHover: '#F1F5F9',
          border: '#E2E8F0',
          subtle: '#F1F5F9'
        }
      }
    },
  },
  plugins: [],
}
