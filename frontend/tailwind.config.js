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
      // Cores vêm de variáveis CSS (styles/tema.css): céu noturno no escuro, nascer do sol no claro.
      // `veu` é a película translúcida de bordas e realces: branca no escuro, tinta no claro.
      colors: {
        'primary': 'rgb(var(--c-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--c-primary-container) / <alpha-value>)',
        'on-primary': 'rgb(var(--c-on-primary) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--c-on-primary-container) / <alpha-value>)',
        'secondary': 'rgb(var(--c-secondary) / <alpha-value>)',
        'secondary-container': 'rgb(var(--c-secondary-container) / <alpha-value>)',
        'tertiary': 'rgb(var(--c-tertiary) / <alpha-value>)',
        'tertiary-container': 'rgb(var(--c-tertiary-container) / <alpha-value>)',
        'surface': 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-container': 'rgb(var(--c-surface-container) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--c-surface-container-low) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--c-surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--c-surface-container-highest) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--c-surface-container-lowest) / <alpha-value>)',
        'on-surface': 'rgb(var(--c-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--c-on-surface-variant) / <alpha-value>)',
        'outline': 'rgb(var(--c-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--c-outline-variant) / <alpha-value>)',
        'background': 'rgb(var(--c-background) / <alpha-value>)',
        'on-background': 'rgb(var(--c-on-background) / <alpha-value>)',
        'error': 'rgb(var(--c-error) / <alpha-value>)',
        'error-container': 'rgb(var(--c-error-container) / <alpha-value>)',
        'brass': 'rgb(var(--c-brass) / <alpha-value>)',
        'cream': 'rgb(var(--c-cream) / <alpha-value>)',
        'on-cream': 'rgb(var(--c-on-cream) / <alpha-value>)',
        'veu': 'rgb(var(--c-veu) / <alpha-value>)',
        'on-cta': 'rgb(var(--c-on-cta) / <alpha-value>)',
      },
      backgroundImage: {
        'orbis-aurora': 'var(--bg-aurora)',
        'orbis-fade': 'var(--bg-fade)',
        'orbis-cta': 'var(--bg-cta)',
        'orbis-wordmark': 'var(--bg-wordmark)',
        'orbis-meteoro': 'var(--bg-meteoro)',
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
          '0%, 100%': { opacity: '0.65', boxShadow: '0 0 0 rgb(var(--c-primary-container) / 0)' },
          '50%': { opacity: '1', boxShadow: '0 0 18px rgb(var(--c-primary-container) / 0.55)' },
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
          '0%, 100%': { boxShadow: 'var(--sombra-vidro), 0 0 0 rgb(var(--c-primary-container) / 0), inset 0 1px rgb(var(--c-veu) / 0.05)' },
          '50%': { boxShadow: 'var(--sombra-vidro), 0 0 46px rgb(var(--c-tertiary-container) / 0.18), inset 0 1px rgb(var(--c-veu) / 0.05)' },
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
        // Entrada de página: termina em `transform: none` para não prender elementos fixed
        'orbis-page': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
        // Troca de tema: o ícone de sol/lua gira ao entrar
        'orbis-astro': {
          from: { opacity: '0', transform: 'rotate(-90deg) scale(0.6)' },
          to: { opacity: '1', transform: 'rotate(0) scale(1)' },
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
        'orbis-page': 'orbis-page 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'orbis-astro': 'orbis-astro 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      fontFamily: {
        // Marcellus: títulos, como letra gravada em placa de instrumento; Marcellus SC: wordmark ORBIS;
        // Instrument Sans: texto, navegação e rótulos; DM Mono: só leituras de instrumento (graus, coordenadas)
        'headline': ['Marcellus', 'Georgia', 'serif'],
        'marca': ['"Marcellus SC"', 'Marcellus', 'Georgia', 'serif'],
        'body': ['Instrument Sans', 'system-ui', 'sans-serif'],
        'label': ['Instrument Sans', 'system-ui', 'sans-serif'],
        'dados': ['DM Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
