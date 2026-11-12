import { alternarTema, useTema } from '../../utils/tema'

// Alterna entre céu noturno e nascer do sol. O ícone mostra o tema de destino
// e gira ao entrar (a `key` remonta o span a cada troca).
export default function BotaoTema({ className = '', comRotulo = false }) {
  const tema = useTema()
  const destino = tema === 'light' ? 'Céu noturno' : 'Nascer do sol'

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={`Mudar para o tema ${destino}`}
      title={destino}
      className={`flex h-11 items-center justify-center gap-2 rounded-full border border-veu/10 bg-surface-container-low text-secondary transition-colors duration-300 hover:border-secondary/40 lg:h-10 ${comRotulo ? 'px-4' : 'w-11 lg:w-10'} ${className}`}
    >
      <span key={tema} className="material-symbols-outlined text-xl motion-safe:animate-orbis-astro">
        {tema === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
      {comRotulo && <span className="text-sm font-medium text-on-surface-variant">{destino}</span>}
    </button>
  )
}
