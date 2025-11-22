import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f14',
        panel: '#111826',
        text: '#e5e7eb',
        accent: '#22d3ee',
        success: '#22c55e',
        danger: '#ef4444'
      }
    },
  },
  plugins: [],
} satisfies Config
