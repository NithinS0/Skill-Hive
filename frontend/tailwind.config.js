/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Modern Dark Theme
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-accent': '#334155',
        'primary-purple': '#8b5cf6',
        'secondary-purple': '#a78bfa',
        'accent-purple': '#c4b5fd',
        'primary-cyan': '#06b6d4',
        'secondary-cyan': '#22d3ee',
        'accent-cyan': '#67e8f9',
        'primary-rose': '#f43f5e',
        'secondary-rose': '#fb7185',
        'accent-rose': '#fda4af',
        'dark-text': '#f1f5f9',
        'medium-text': '#e2e8f0',
        'light-text': '#cbd5e1',
      },
      boxShadow: {
        'dark-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'dark-glow-strong': '0 0 30px rgba(139, 92, 246, 0.5)',
      }
    },
  },
  plugins: [],
}