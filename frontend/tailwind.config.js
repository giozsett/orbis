/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#ffb1c3',
        'primary-container': '#ff4b89',
        'on-primary': '#66002c',
        'on-primary-container': '#590026',
        'secondary': '#eab9ce',
        'secondary-container': '#633e4f',
        'tertiary': '#deb7ff',
        'tertiary-container': '#b86dfd',
        'surface': '#0b1323',
        'surface-container': '#18202f',
        'surface-container-low': '#131c2b',
        'surface-container-high': '#222a3a',
        'surface-container-highest': '#2d3546',
        'surface-container-lowest': '#060e1d',
        'on-surface': '#dbe2f8',
        'on-surface-variant': '#e5bcc4',
        'outline': '#ac878f',
        'outline-variant': '#5c3f45',
        'background': '#0b1323',
        'on-background': '#dbe2f8',
        'error': '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
