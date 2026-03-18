import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0C10',
        surface: '#13161D',
        border: '#1E2330',
        accent: '#4F7EF7',
        'accent-hover': '#6B95FF',
        success: '#2DD4BF',
        warning: '#F59E0B',
        'text-primary': '#F0F2F8',
        'text-secondary': '#8891A8',
        'text-muted': '#4A5162',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        badge: '6px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(79,126,247,0.15), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(79,126,247,0.3), 0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
export default config
