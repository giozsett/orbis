/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // xs separa os Galaxy S25/S26 (360px) dos iPhone 14/15 (390px+); fica fora do extend para vir antes de sm no CSS
    screens: { xs: '380px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
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
        'brass': '#d9b06b',
        'cream': '#fffae2',
        'on-cream': '#0b1323',
      },
      backgroundImage: {
        'orbis-aurora':
          'radial-gradient(1100px 750px at 8% -8%, #ff4b89 0%, rgba(255,75,137,0.55) 18%, rgba(184,109,253,0.35) 34%, rgba(11,19,35,0) 60%), ' +
          'radial-gradient(700px 500px at 22% 18%, rgba(222,183,255,0.28) 0%, rgba(11,19,35,0) 55%)',
        'orbis-fade': 'linear-gradient(160deg, rgba(6,14,29,0) 30%, #060e1d 92%)',
        'orbis-cta': 'linear-gradient(120deg, #ff4b89, #b86dfd)',
        'orbis-wordmark': 'linear-gradient(110deg, #dbe2f8 0%, #dbe2f8 36%, #ffffff 44%, #ffb1c3 50%, #dbe2f8 58%, #eab9ce 100%)',
        'orbis-meteoro': 'linear-gradient(90deg, #ffffff, rgba(255,177,195,0.9) 30%, rgba(255,255,255,0))',
      },
      // Animações da tela de login (usar sempre com motion-safe:)
      keyframes: {
        'orbis-rise': {
          from: { opacity: '0', transform: 'translateY(24px)', filter: 'blur(6px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'orbis-card-in': {
          from: { opacity: '0', transform: 'translateX(40px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'orbis-drop': {
          from: { transform: 'translateY(-110%)' },
          to: { transform: 'translateY(0)' },
        },
        'orbis-header': {
          from: { opacity: '0', transform: 'translateY(-100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'orbis-bracket': {
          from: { width: '0', height: '0', opacity: '0' },
          to: { width: '26px', height: '26px', opacity: '1' },
        },
        'orbis-shimmer': {
          '0%': { backgroundPosition: '100% 0' },
          '45%, 100%': { backgroundPosition: '0% 0' },
        },
        'orbis-aurora': {
          '0%, 100%': { opacity: '1', transform: 'scale(1) translate(0, 0)' },
          '50%': { opacity: '0.78', transform: 'scale(1.08) translate(1.5%, 1%)' },
        },
        'orbis-grow': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        'orbis-glow': {
          '0%, 100%': { opacity: '0.65', boxShadow: '0 0 0 rgba(255,75,137,0)' },
          '50%': { opacity: '1', boxShadow: '0 0 18px rgba(255,75,137,0.55)' },
        },
        'orbis-sphere-in': {
          from: { opacity: '0', transform: 'scale(0.85) rotate(-25deg)' },
          to: { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
        'orbis-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'orbis-sweep': {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(8deg)' },
        },
        'orbis-twinkle': {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        'orbis-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'orbis-halo': {
          '0%, 100%': { boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 rgba(255,75,137,0), inset 0 1px rgba(255,255,255,0.05)' },
          '50%': { boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 46px rgba(184,109,253,0.18), inset 0 1px rgba(255,255,255,0.05)' },
        },
        'orbis-swap': {
          from: { opacity: '0', transform: 'translateY(12px)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'orbis-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        'orbis-meteoro': {
          '0%': { opacity: '0', transform: 'rotate(-28deg) translateX(0)' },
          '4%': { opacity: '1' },
          '12%, 100%': { opacity: '0', transform: 'rotate(-28deg) translateX(-110vw)' },
        },
        // Mandala do mapa natal: traços desenhados com pathLength=1
        'orbis-draw': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        'orbis-pop': {
          from: { opacity: '0', transform: 'scale(0.4)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        'orbis-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'orbis-rise': 'orbis-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-card-in': 'orbis-card-in 1s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both, orbis-halo 7s ease-in-out 1.4s infinite',
        'orbis-drop': 'orbis-drop 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
        'orbis-header': 'orbis-header 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-bracket': 'orbis-bracket 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both',
        'orbis-shimmer': 'orbis-shimmer 7s ease-in-out 1.2s infinite',
        'orbis-aurora': 'orbis-aurora 16s ease-in-out infinite',
        'orbis-edge': 'orbis-grow 1.2s cubic-bezier(0.22, 1, 0.36, 1) both, orbis-glow 4s ease-in-out 1.2s infinite',
        'orbis-sphere-in': 'orbis-sphere-in 1.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-spin-slow': 'orbis-spin 140s linear infinite',
        'orbis-spin-rev': 'orbis-spin 95s linear infinite reverse',
        'orbis-ring-a': 'orbis-spin 70s linear infinite',
        'orbis-ring-b': 'orbis-spin 110s linear infinite reverse',
        'orbis-sweep': 'orbis-sweep 12s ease-in-out infinite',
        'orbis-twinkle': 'orbis-twinkle 3s ease-in-out infinite',
        'orbis-float': 'orbis-float 6s ease-in-out infinite',
        'orbis-swap': 'orbis-swap 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-shake': 'orbis-shake 0.45s ease-in-out',
        'orbis-meteoro': 'orbis-meteoro 9s ease-out infinite',
        'orbis-draw': 'orbis-draw 1.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-pop': 'orbis-pop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-fade-in': 'orbis-fade-in 1.2s ease-out both',
      },
      fontFamily: {
        // Fraunces: títulos e numerais dos arcanos; Instrument Sans: texto e interface;
        // DM Mono: leituras de instrumento (graus, coordenadas, rótulos técnicos)
        'headline': ['Fraunces', 'Georgia', 'serif'],
        'body': ['Instrument Sans', 'system-ui', 'sans-serif'],
        'label': ['DM Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
