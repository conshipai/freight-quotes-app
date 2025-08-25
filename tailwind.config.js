/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'conship-purple': '#6B46C1',
        'conship-orange': '#FB923C',
      }
    },
  },
  plugins: [],
}
