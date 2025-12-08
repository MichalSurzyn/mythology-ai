/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        runewood: ['Runewood', 'sans-serif'],
        Ole: ['Ole', 'sans-serif'],
        Italianno: ['Italianno', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
