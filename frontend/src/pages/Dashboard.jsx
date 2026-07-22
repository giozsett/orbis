import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

export default function Dashboard() {
  const mainRef = useRef(null)

  useEffect(() => {
    if (!mainRef.current) return

    // Gerar estrelas aleatórias
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div')
      const size = Math.random() * 2 + 'px'
      star.style.width = size
      star.style.height = size
      star.style.position = 'absolute'
      star.style.left = Math.random() * 100 + '%'
      star.style.top = Math.random() * 100 + '%'
      star.style.backgroundColor = 'white'
      star.style.opacity = String(Math.random() * 0.5)
      star.style.borderRadius = '50%'
      star.style.pointerEvents = 'none'
      if (Math.random() > 0.8) {
        star.classList.add('animate-twinkle')
      }
      mainRef.current.appendChild(star)
    }

    return () => {
      if (mainRef.current) {
        mainRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <Layout showSidebar={false}>
      <div
        ref={mainRef}
        className="h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #060e1d 100%)' }}
      >
        {/* Container vazio */}
        <div className="relative z-10 max-w-2xl px-4 flex flex-col items-center text-center">
          {/* Ilustração do telescópio */}
          <div className="mb-12 animate-float">
            <div className="w-64 h-64 glass-panel rounded-full flex items-center justify-center relative overflow-hidden border border-white/5">
              <div className="relative w-48 h-48">
                <div className="w-full h-full opacity-80 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[120px] text-primary/30">telescope</span>
                </div>
              </div>

              {/* Partículas */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse-soft" />
                <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-secondary rounded-full animate-pulse-soft" style={{ animationDelay: '0.7s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-tertiary rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-4 mb-12">
            <h1 className="font-headline text-5xl md:text-[56px] text-on-surface tracking-tight leading-tight">
              Seu destino ainda não foi traçado
            </h1>
            <p className="text-lg text-on-surface-variant max-w-md mx-auto opacity-80">
              O observatório está pronto. Calibre suas coordenadas e inicie sua jornada através das constelações para gerar sua primeira análise astrológica.
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/criar-mapa"
            className="bg-primary text-on-primary font-label px-8 py-4 rounded-full flex items-center gap-4 group transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,0,122,0.2)] hover:shadow-[0_0_30px_rgba(255,0,122,0.4)]"
          >
            <span className="font-bold tracking-widest uppercase">Gerar Primeiro Mapa</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>

          {/* Dicas */}
          <div className="mt-8 flex gap-8 justify-center opacity-60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span className="font-label text-xs">Dados de Alta Precisão</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">public</span>
              <span className="font-label text-xs">Cobertura Global</span>
            </div>
          </div>
        </div>

        {/* Gradiente inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </Layout>
  )
}
