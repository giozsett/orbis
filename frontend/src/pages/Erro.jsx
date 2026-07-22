import { Link } from 'react-router-dom'

export default function Erro() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Glow de fundo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-16 h-16 bg-surface/40 backdrop-blur-xl border-b border-white/15">
        <Link to="/dashboard" className="font-headline text-lg font-bold tracking-tighter text-secondary">ORBIS</Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/dashboard" className="font-label text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Dashboard</Link>
          <Link to="/horoscopo" className="font-label text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Transits</Link>
          <Link to="/interpretacoes" className="font-label text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Ephemeris</Link>
          <Link to="/mapa" className="font-label text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Natal</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer active:opacity-80">account_circle</span>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="z-10 w-full max-w-4xl px-4 md:px-16 text-center flex flex-col items-center">
        {/* Ilustração de erro */}
        <div className="relative w-64 h-64 mb-8 group">
          {/* Eclipse central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-surface-container-lowest rounded-full relative z-20 border border-white/10 overflow-hidden"
              style={{ boxShadow: '0 0 60px rgba(255, 0, 122, 0.2)' }}
            >
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#F4C2D7_3px)]" />
            </div>
            <div className="absolute w-40 h-40 bg-primary/30 rounded-full blur-2xl animate-pulse-soft" />
          </div>

          {/* Sinal orbitando */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'orbit 12s linear infinite' }}>
            <div className="w-4 h-4 bg-secondary rounded-full shadow-[0_0_15px_rgba(234,185,206,0.8)]" />
          </div>

          {/* Linhas de sinal interrompidas */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-error/40 to-transparent scale-x-150 rotate-45 opacity-50" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-error/40 to-transparent scale-x-150 -rotate-45 opacity-30" />
        </div>

        {/* Tipografia */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-label text-xs text-primary uppercase tracking-[0.2em] px-2 py-1 border border-primary/20 rounded">
              Erro 404 // Fluxo Interrompido
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight">Interferência Cósmica</h1>
          <p className="text-lg text-on-surface-variant/80">
            Os sensores do observatório detectaram um <span className="text-primary">alinhamento inválido</span> para as coordenadas fornecidas. A transmissão de dados foi pausada para evitar corrupção sistêmica.
          </p>
        </div>

        {/* Detalhes do erro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
          <div className="glass-panel p-4 rounded-xl text-left border-l-4 border-l-primary/30">
            <span className="font-label text-xs text-secondary block mb-1">CAUSA PROVÁVEL</span>
            <p className="text-sm">Sincronização temporal fora dos parâmetros orbitais permitidos ou limite de processamento atingido.</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-left border-l-4 border-l-tertiary/30">
            <span className="font-label text-xs text-tertiary block mb-1">SUGESTÃO</span>
            <p className="text-sm">Verifique a geolocalização selecionada ou tente redefinir o intervalo de tempo da efeméride.</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link
            to="/dashboard"
            className="bg-primary text-on-primary font-label px-8 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,0,122,0.4)]"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Tentativa de Reconexão
          </Link>
          <Link
            to="/criar-mapa"
            className="border border-secondary/30 text-secondary font-label px-8 py-3 rounded-lg hover:bg-secondary/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">edit_location_alt</span>
            Corrigir Coordenadas
          </Link>
        </div>
      </main>

      {/* Sidebar fantasma */}
      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] z-40 p-6 flex-col w-80 bg-surface-container-low/20 backdrop-blur-sm border-r border-white/5 opacity-50 pointer-events-none">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest" />
            <div>
              <div className="font-label text-sm text-on-surface">Celestial Details</div>
              <div className="font-label text-xs text-outline">Offline</div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-3/4 bg-white/5 rounded" />
          <div className="h-4 w-1/2 bg-white/5 rounded" />
          <div className="h-4 w-2/3 bg-white/5 rounded" />
        </div>
      </aside>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-4 px-16 flex justify-between items-center bg-surface-container-lowest border-t border-white/5">
        <div className="font-label text-xs text-outline">© 2024 Orbis Astronomical Observatory</div>
        <div className="flex gap-4">
          <span className="text-sm text-outline hover:text-primary transition-colors cursor-pointer">Data Sources</span>
          <span className="text-sm text-outline hover:text-primary transition-colors cursor-pointer">Privacy</span>
          <span className="text-sm text-outline hover:text-primary transition-colors cursor-pointer">Methodology</span>
        </div>
      </footer>
    </div>
  )
}
