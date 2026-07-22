export default function ZodiacSign({ signo, isActive = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 group ${
        isActive
          ? 'bg-primary/10 border border-primary/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div
        className={`text-3xl transition-all duration-300 ${
          isActive ? 'animate-zodiac-glow' : 'group-hover:scale-125'
        }`}
        style={{
          '--zodiac-color': isActive ? 'rgba(255, 177, 195, 0.6)' : 'rgba(255, 177, 195, 0.3)',
        }}
      >
        {signo.simbolo}
      </div>
      <span className={`font-label text-xs transition-colors duration-300 ${
        isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'
      }`}>
        {signo.nome}
      </span>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-surface-container-high rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        <span className="font-label text-xs text-on-surface">{signo.nome}</span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-container-high rotate-45 -mt-1" />
      </div>
    </button>
  )
}
