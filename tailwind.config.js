/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#6366F1',
        'accent-orange': '#F97316',
        success: '#10B981',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
