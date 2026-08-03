import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import MapSummaryCard from '../components/map/MapSummaryCard'
import GlassPanel from '../components/ui/GlassPanel'

export default function Dashboard() {
  const navigate = useNavigate()
  const starsRef = useRef(null)
  const [mapas, setMapas] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/mapas', { headers: { Accept: 'application/json' } })
      .then(async response => {
        const data = await response.json()
        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        if (!response.ok) throw new Error(data.erro || 'Não foi possível carregar a Dashboard.')
        setMapas(data.mapas || [])
      })
      .catch(error => setErro(error.message))
  }, [navigate])

  useEffect(() => {
    const starField = starsRef.current
    if (!starField) return undefined

    const stars = Array.from({ length: 50 }, () => {
      const star = document.createElement('span')
      const size = `${Math.random() * 2}px`
      star.style.width = size
      star.style.height = size
      star.style.position = 'absolute'
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.backgroundColor = 'white'
      star.style.opacity = String(Math.random() * 0.5)
      star.style.borderRadius = '50%'
      if (Math.random() > 0.8) star.classList.add('animate-twinkle')
      starField.appendChild(star)
      return star
    })

    return () => stars.forEach(star => star.remove())
  }, [])

  const principal = mapas?.find(mapa => mapa.principal)

  return (
    <Layout>
      <div
        className="relative min-h-[calc(100vh-64px)] overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 35%, #0f172a 0%, #060e1d 75%)' }}
      >
        <div ref={starsRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />

        {erro && (
          <div className="relative z-10 p-8 text-error md:p-16" role="alert">{erro}</div>
        )}

        {!erro && mapas === null && (
          <div className="relative z-10 flex min-h-[calc(100vh-64px)] items-center justify-center gap-3 text-outline">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Carregando seu observatório…
          </div>
        )}

        {mapas?.length === 0 && (
          <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
            <div className="mb-10 animate-float">
              <div className="glass-panel relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border border-white/5">
                <span className="material-symbols-outlined text-[120px] text-primary/30">telescope</span>
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/4 top-1/4 h-1 w-1 animate-pulse-soft rounded-full bg-primary" />
                  <div className="absolute right-1/3 top-1/2 h-0.5 w-0.5 animate-pulse-soft rounded-full bg-secondary" />
                  <div className="absolute bottom-1/4 right-1/4 h-1 w-1 animate-pulse-soft rounded-full bg-tertiary" />
                </div>
              </div>
            </div>

            <div className="mb-10 space-y-4">
              <h1 className="font-headline text-5xl leading-tight tracking-tight text-on-surface md:text-[56px]">
                Seu destino ainda não foi traçado
              </h1>
              <p className="mx-auto max-w-md text-lg text-on-surface-variant opacity-80">
                O observatório está pronto. Informe seus dados de nascimento para gerar sua primeira análise astrológica.
              </p>
            </div>

            <Link
              to="/criar-mapa"
              className="group flex items-center gap-4 rounded-full bg-primary px-8 py-4 font-label text-on-primary shadow-[0_0_20px_rgba(255,0,122,0.2)] transition-all duration-500 hover:scale-105"
            >
              <span className="font-bold uppercase tracking-widest">Gerar primeiro mapa</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        )}

        {principal && (
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-12 md:py-16">
            <header className="mb-10 animate-fade-in-up">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Observatório pessoal</span>
              <h1 className="mt-2 font-headline text-4xl text-on-surface md:text-5xl">Seu céu está traçado</h1>
              <p className="mt-3 max-w-2xl text-on-surface-variant">
                Acompanhe seu mapa principal ou explore os outros mapas já calculados na sua conta.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <MapSummaryCard mapa={principal} destaque />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <GlassPanel className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-label text-xs uppercase tracking-widest text-outline">Mapas criados</p>
                      <p className="mt-2 font-headline text-4xl text-secondary">{mapas.length}</p>
                    </div>
                    <span className="material-symbols-outlined text-5xl text-secondary/40">orbit</span>
                  </div>
                  <Link to="/meus-mapas" className="mt-5 flex items-center gap-2 font-label text-sm text-primary hover:text-secondary">
                    Ver todos os mapas
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </GlassPanel>

                <GlassPanel className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-tertiary">add_circle</span>
                    <div>
                      <h2 className="font-headline text-xl">Novo mapa</h2>
                      <p className="mt-1 text-sm text-on-surface-variant">Calcule outra configuração natal.</p>
                    </div>
                  </div>
                  <Link to="/criar-mapa" className="mt-5 inline-flex rounded-full border border-tertiary/30 px-4 py-2 font-label text-xs text-tertiary hover:bg-tertiary/10">
                    Criar outro mapa
                  </Link>
                </GlassPanel>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
