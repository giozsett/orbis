import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import MapSummaryCard from '../components/map/MapSummaryCard'

export default function MeusMapas() {
  const navigate = useNavigate()
  const [mapas, setMapas] = useState(null)
  const [erro, setErro] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [excluindoId, setExcluindoId] = useState(null)
  const [removendoId, setRemovendoId] = useState(null)

  useEffect(() => {
    fetch('/mapas', { headers: { Accept: 'application/json' } })
      .then(async response => {
        const data = await response.json()
        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        if (!response.ok) throw new Error(data.erro || 'Não foi possível carregar seus mapas.')
        setMapas(data.mapas || [])
      })
      .catch(error => setErro(error.message))
  }, [navigate])

  const excluirMapa = async (mapaId) => {
    if (excluindoId !== null) return
    setErroAcao('')
    setExcluindoId(mapaId)

    try {
      const response = await fetch(`/mapas/${mapaId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      const data = await response.json()
      if (response.status === 401) {
        navigate('/login', { replace: true })
        return
      }
      if (!response.ok) throw new Error(data.erro || 'Não foi possível excluir o mapa.')

      setRemovendoId(mapaId)
      await new Promise(resolve => window.setTimeout(resolve, 450))
      setMapas(atuais => atuais.filter(mapa => mapa.id !== mapaId))
      setRemovendoId(null)
    } catch (error) {
      setErroAcao(error.message)
    } finally {
      setExcluindoId(null)
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Seu observatório</span>
              <h1 className="mt-2 font-headline text-4xl text-on-surface md:text-5xl">Meus Mapas</h1>
              <p className="mt-3 max-w-2xl text-on-surface-variant">
                Consulte todos os mapas já calculados. O primeiro permanece como principal para personalizar o horóscopo e o Chat Astral.
              </p>
            </div>
            <Link
              to="/criar-mapa"
              className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-label text-sm text-on-primary transition-all hover:shadow-[0_0_24px_rgba(255,177,195,0.25)]"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Criar outro mapa
            </Link>
          </header>

          {erro && (
            <div className="mt-8 rounded-xl border border-error/20 bg-error/10 p-4 text-error" role="alert">
              {erro}
            </div>
          )}

          {erroAcao && (
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-error animate-fade-in" role="alert">
              <span className="material-symbols-outlined">error</span>
              {erroAcao}
            </div>
          )}

          {!erro && mapas === null && (
            <div className="flex items-center gap-3 py-16 text-outline">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Carregando seus mapas…
            </div>
          )}

          {mapas?.length === 0 && (
            <div className="mt-10 rounded-2xl border border-white/5 bg-surface-container-low/50 p-10 text-center">
              <span className="material-symbols-outlined text-6xl text-primary/40">telescope</span>
              <h2 className="mt-4 font-headline text-2xl">Nenhum mapa criado ainda</h2>
              <p className="mx-auto mt-2 max-w-md text-on-surface-variant">Crie seu primeiro mapa para iniciar sua jornada pelo ORBIS.</p>
              <Link to="/criar-mapa" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-label text-sm text-on-primary">
                Criar primeiro mapa
              </Link>
            </div>
          )}

          {mapas?.length > 0 && (
            <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2" aria-label="Mapas natais criados">
              {mapas.map(mapa => (
                <MapSummaryCard
                  key={mapa.id}
                  mapa={mapa}
                  destaque={mapa.principal}
                  onDelete={excluirMapa}
                  excluindo={excluindoId === mapa.id}
                  removendo={removendoId === mapa.id}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </Layout>
  )
}
