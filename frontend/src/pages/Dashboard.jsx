import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AstrologyObservatory from '../components/dashboard/AstrologyObservatory'
import Layout from '../components/layout/Layout'
import MapSummaryCard from '../components/map/MapSummaryCard'
import GlassPanel from '../components/ui/GlassPanel'
import EsferaArmilar from '../components/ui/EsferaArmilar'
import TituloMoldurado from '../components/ui/TituloMoldurado'

export default function Dashboard() {
  const navigate = useNavigate()
  const starsRef = useRef(null)
  const [mapas, setMapas] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/mapas', { headers: { Accept: 'application/json' } })
      .then(async response => {
        const data = await response.json()
        if (response.status === 401) { navigate('/login', { replace: true }); return }
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
      Object.assign(star.style, { width: size, height: size, position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, backgroundColor: 'white', opacity: String(Math.random() * 0.5), borderRadius: '50%' })
      if (Math.random() > 0.8) star.classList.add('animate-twinkle')
      starField.appendChild(star)
      return star
    })
    return () => stars.forEach(star => star.remove())
  }, [])

  const principal = mapas?.find(mapa => mapa.principal)

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div ref={starsRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
        {erro && <div className="relative z-10 m-8 flex items-center gap-3 rounded-2xl border border-error/30 bg-error-container/20 p-4 text-error motion-safe:animate-orbis-shake md:m-16" role="alert"><span className="material-symbols-outlined">error</span>{erro}</div>}
        {!erro && mapas === null && <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-8"><div className="motion-safe:animate-orbis-float"><EsferaArmilar animada className="h-48 w-48 opacity-80 motion-safe:animate-orbis-sphere-in" /></div><p className="font-label text-xs uppercase tracking-[0.22em] text-outline motion-safe:animate-orbis-twinkle">Carregando seu observatório</p></div>}

        {mapas !== null && !erro && (
          <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-12 md:py-16">
            {mapas.length === 0 && (
              <GlassPanel className="relative overflow-hidden p-7 motion-safe:animate-orbis-card-in md:p-10">
                <div className="absolute -right-12 -top-12 h-48 w-48 animate-spin-slow rounded-full border border-primary/10" aria-hidden="true" />
                <div className="relative flex flex-col items-center gap-7 text-center md:flex-row md:text-left">
                  <div className="flex h-28 w-28 shrink-0 animate-float items-center justify-center rounded-full border border-primary/20 bg-primary/5"><span className="material-symbols-outlined text-6xl text-primary/70">telescope</span></div>
                  <div className="flex-1"><span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Primeira observação</span><h1 className="mt-2 font-headline text-3xl text-on-surface md:text-4xl">Seu céu espera para ser traçado</h1><p className="mt-3 max-w-2xl text-on-surface-variant/80">Informe seus dados de nascimento para revelar sua configuração natal e receber análises personalizadas.</p></div>
                  <Link to="/criar-mapa" className="group flex shrink-0 items-center gap-3 rounded-full bg-orbis-cta px-6 py-3.5 font-label text-xs uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(255,75,137,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(255,75,137,0.38)]">Criar primeiro mapa<span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span></Link>
                </div>
              </GlassPanel>
            )}

            {principal && <>
              <header className="mb-10"><p className="mb-4 font-label text-[11px] uppercase tracking-[0.32em] text-primary motion-safe:animate-orbis-rise sm:text-xs" style={{ animationDelay: '150ms' }}>Observatório pessoal</p><TituloMoldurado style={{ animationDelay: '280ms' }}>Seu céu está traçado</TituloMoldurado><p className="mt-5 max-w-2xl leading-[1.7] text-on-surface-variant motion-safe:animate-orbis-rise" style={{ animationDelay: '430ms' }}>Acompanhe seu mapa principal ou explore os outros mapas já calculados na sua conta.</p></header>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <MapSummaryCard mapa={principal} destaque />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <GlassPanel className="p-6"><div className="flex items-center justify-between"><div><p className="font-label text-xs uppercase tracking-widest text-outline">Mapas criados</p><p className="mt-2 font-headline text-4xl text-secondary">{mapas.length}</p></div><span className="material-symbols-outlined text-5xl text-secondary/40">orbit</span></div><Link to="/meus-mapas" className="mt-5 flex items-center gap-2 font-label text-sm text-primary hover:text-secondary">Ver todos os mapas<span className="material-symbols-outlined text-base">arrow_forward</span></Link></GlassPanel>
                  <GlassPanel className="p-6"><div className="flex items-center gap-3"><span className="material-symbols-outlined text-3xl text-tertiary">add_circle</span><div><h2 className="font-headline text-xl">Novo mapa</h2><p className="mt-1 text-sm text-on-surface-variant">Calcule outra configuração natal.</p></div></div><Link to="/criar-mapa" className="mt-5 inline-flex rounded-full border border-tertiary/30 px-4 py-2 font-label text-xs text-tertiary hover:bg-tertiary/10">Criar outro mapa</Link></GlassPanel>
                </div>
              </div>
            </>}
            <AstrologyObservatory />
          </main>
        )}
      </div>
    </Layout>
  )
}
