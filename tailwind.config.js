/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vault-primary': '#10b981',    // emerald green – money/success
        'vault-accent': '#6366f1',     // indigo – trust/tech
        'vault-dark': '#0f172a',       // dark background
        'vault-light': '#f8fafc',      // light background
      },
    },
  },
  plugins: [],
}