/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#2a2320',
          2: '#524a44',
          3: '#857a72',
        },
        sand: {
          DEFAULT: '#efe9e2',
          2: '#e2d9cf',
          3: '#c9bfb4',
        },
        cream: '#f9f7f4',
        accent: {
          DEFAULT: '#9e5a44',
          2: '#b8735a',
          light: '#f3ebe6',
        },
        gold: '#b08d4a',
      },
      boxShadow: {
        card: '0 2px 12px rgba(26,18,9,0.08)',
        card2: '0 8px 32px rgba(26,18,9,0.14)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
    },
  },
  plugins: [],
}