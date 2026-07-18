/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B0000',
          hover: '#a30000',
          light: '#b80000'
        }
      }
    },
  },
  plugins: [],
}
