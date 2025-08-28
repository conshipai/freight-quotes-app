// tailwind.config.js (in your quote app)
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'conship-purple': '#5B21B6', // Purple-700
        'conship-orange': '#FB923C', // Orange-400
      }
    }
  },
  plugins: []
};
