module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tool-bg': '#1F2937',
        'tool-bg-2': '#374151',
        'tool-border': '#374151',
        'tool-border-active': '#6366F1',
        'tool-primary': '#6366F1',
        'tool-accent': '#F97316',
        'tool-text': '#F9FAFB',
        'tool-muted': '#9CA3AF',
        'tool-disabled': '#4B5563',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Noto Sans TC', 'sans-serif'],
      },
      boxShadow: {
        'tool-hover': '0 10px 25px -5px rgba(99, 102, 241, 0.12), 0 8px 10px -6px rgba(99, 102, 241, 0.08)',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
}
