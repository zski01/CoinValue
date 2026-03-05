/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vault-primary': '#10b981',
        'vault-accent': '#6366f1',
        'vault-dark': '#0f172a',
        'vault-light': '#f8fafc',
      },
    },
  },
  plugins: [],
}