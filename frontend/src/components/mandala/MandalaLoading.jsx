export default function MandalaLoading() {
  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
      {/* Glow externo */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-[64px] animate-pulse-soft" />

      {/* Anéis orbitais */}
      <svg className="w-full h-full text-primary/40" viewBox="0 0 400 400">
        {/* Camada interna */}
        <g className="animate-rotate-slow" style={{ transformOrigin: 'center' }}>
          <circle cx="200" cy="200" fill="none" r="80" stroke="currentColor" strokeDasharray="4 8" strokeWidth="0.5" />
          <polygon
            fill="none"
            points="200,100 230,170 300,170 245,215 265,285 200,240 135,285 155,215 100,170 170,170"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>

        {/* Camada zodíaca */}
        <g className="animate-rotate-reverse" style={{ transformOrigin: 'center' }}>
          <circle cx="200" cy="200" fill="none" r="140" stroke="currentColor" strokeDasharray="1 15" strokeLinecap="round" strokeWidth="0.5" />
          <path d="M200 40 L200 60 M360 200 L340 200 M200 360 L200 340 M40 200 L60 200" stroke="currentColor" strokeWidth="2" />
          <circle cx="200" cy="200" fill="none" r="130" stroke="currentColor" strokeWidth="0.25" />
        </g>

        {/* Camada externa */}
        <g className="animate-rotate-slow" style={{ transformOrigin: 'center', animationDuration: '90s' }}>
          <circle cx="200" cy="200" fill="none" r="180" stroke="currentColor" strokeDasharray="100 20" strokeWidth="1" />
        </g>
      </svg>

      {/* Núcleo */}
      <div className="absolute w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_#ffb1c3] z-30" />

      {/* Nós flutuantes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-2 h-2 bg-secondary rounded-full animate-pulse-soft" style={{ top: '20%', left: '30%' }} />
        <div className="absolute w-1 h-1 bg-tertiary rounded-full animate-pulse-soft" style={{ bottom: '25%', right: '20%', animationDelay: '0.5s' }} />
        <div className="absolute w-1.5 h-1.5 bg-primary rounded-full animate-float" style={{ top: '45%', right: '10%', animationDuration: '3s' }} />
      </div>
    </div>
  )
}
