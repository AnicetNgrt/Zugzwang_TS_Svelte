const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.svelte"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Cabinet Grotesk', 'sans-serif'],
        'serif': ['Stardom', 'serif'],
        'mono': ['RX100', 'monospace']
      },
      colors: {
        primary: colors.neutral
      }
    },
  },
  plugins: [],
}
