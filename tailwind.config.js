/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beer-gold': '#d4951a',
        'beer-amber': '#b8860b',
        'beer-brown': '#8b4513'
      }
    },
  },
  plugins: [],
}
