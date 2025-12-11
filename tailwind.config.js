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
      colors: {
        // Akcent z CSS variable
        accent: {
          DEFAULT: 'var(--accent-color)',
          10: 'rgba(var(--accent-rgb), 0.1)',
          20: 'rgba(var(--accent-rgb), 0.2)',
          30: 'rgba(var(--accent-rgb), 0.3)',
          40: 'rgba(var(--accent-rgb), 0.4)',
          50: 'rgba(var(--accent-rgb), 0.5)',
        },
      },
    },
  },
  plugins: [],
}
