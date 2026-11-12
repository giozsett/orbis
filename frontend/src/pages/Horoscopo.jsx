import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import GlassPanel from '../components/ui/GlassPanel'
import { mapaDeVisuais } from '../utils/tema'

const PERIODOS = [
  { id: 'diario', rotulo: 'Hoje', icone: 'today' },
  { id: 'semanal', rotulo: 'Semana', icone: 'date_range' },
  { id: 'quinzenal', rotulo: 'Quinzena', icone: 'calendar_view_week' },
  { id: 'mensal', rotulo: 'Mês', icone: 'calendar_month' },
]

const AREAS = mapaDeVisuais({
  Amor: { icone: 'favorite', cor: '#ff9ec1' },
  Trabalho: { icone: 'work', cor: '#c3a6ff' },
  'Bem-estar': { icone: 'self_improvement', cor: '#87dfd8' },
})

const ICONES_TENDENCIA = {
  alta: 'trending_up',
  estavel: 'horizontal_rule',
  baixa: 'trending_down',
}

function formatarIntervalo(inicio, fim) {
  if (!inicio || !fim) return ''
  const opcoes = { day: '2-digit', month: 'short', timeZone: 'UTC' }
  const dataInicio = new Date(`${inicio}T12:00:00Z`)
  const dataFim = new Date(`${fim}T12:00:00Z`)
  if (inicio === fim) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(dataInicio)
  }
  return `${new Intl.DateTimeFormat('pt-BR', opcoes).format(dataInicio)} – ${new Intl.DateTimeFormat('pt-BR', { ...opcoes, year: 'numeric' }).format(dataFim)}`
}

export default function Horoscopo() {
  const [dados, setDados] = useState(null)
  const [periodoAtivo, setPeriodoAtivo] = useState('diario')
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(null)
  const [erro, setErro] = useState(null)
  const carregamentoIniciado = useRef(false)
  const solicitados = useRef(new Set())

  const gerarPeriodo = async (periodo) => {
    if (solicitados.current.has(periodo)) return
    solicitados.current.add(periodo)
    setGerando(periodo)
    setErro(null)

    try {
      const response = await fetch('/horoscopo/gerar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodo }),
      })
      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.assign('/login')
        return
      }
      if (!response.ok) throw new Error(payload.erro || 'Não foi possível gerar este ciclo.')

      setDados((atual) => ({
        ...atual,
        periodos: atual.periodos.map((item) => (
          item.id === periodo ? { ...item, disponivel: true } : item
        )),
        horoscopos: {
          ...atual.horoscopos,
          [periodo]: payload.horoscopo,
        },
      }))
    } catch (error) {
      setErro(error.message)
    } finally {
      solicitados.current.delete(periodo)
      setGerando((atual) => (atual === periodo ? null : atual))
    }
  }

  useEffect(() => {
    if (carregamentoIniciado.current) return
    carregamentoIniciado.current = true

    const carregar = async () => {
      try {
        const response = await fetch('/horoscopo', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const payload = await response.json().catch(() => ({}))
        if (response.status === 401) {
          window.location.assign('/login')
          return
        }
        if (!response.ok) {
          setDados({ codigo: payload.codigo, erro: payload.erro })
          return
        }
        setDados(payload)
        setCarregando(false)
        if (!payload.horoscopos?.diario) await gerarPeriodo('diario')
      } catch {
        setErro('Não foi possível carregar seu horóscopo agora.')
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

  const selecionarPeriodo = (periodo) => {
    setPeriodoAtivo(periodo)
    setErro(null)
    if (!dados?.horoscopos?.[periodo]) gerarPeriodo(periodo)
  }

  if (carregando) {
    return (
      <Layout>
        <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center p-6 md:p-8 lg:min-h-[calc(100dvh-64px)]">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
            <p className="mt-4 font-label text-sm uppercase tracking-widest text-outline">Consultando seu ciclo astral</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (dados?.codigo === 'mapa_principal_ausente') {
    return (
      <Layout>
        <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center p-6 md:p-8 lg:min-h-[calc(100dvh-64px)]">
          <GlassPanel className="max-w-xl p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-secondary">orbit</span>
            <h1 className="mt-5 font-headline text-3xl">Seu mapa principal vem primeiro</h1>
            <p className="mt-3 text-on-surface-variant">{dados.erro}</p>
            <Link to="/criar-mapa" className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 font-label text-sm text-on-primary">
              Criar mapa principal
            </Link>
          </GlassPanel>
        </div>
      </Layout>
    )
  }

  const periodo = dados?.periodos?.find((item) => item.id === periodoAtivo)
  const horoscopo = dados?.horoscopos?.[periodoAtivo]
  const estaGerando = gerando === periodoAtivo

  return (
    <Layout>
      <div className="p-4 xs:p-5 md:p-16">
        <header className="mb-6 flex animate-fade-in-up flex-col gap-4 border-b border-veu/5 pb-6 md:mb-8 md:gap-6 md:pb-7 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary">Mapa principal · {dados?.mapa?.nome}</span>
            <h1 className="font-headline text-3xl text-on-surface md:text-5xl">Horóscopo do Seu Mapa</h1>
            <p className="max-w-2xl text-sm text-on-surface-variant md:text-base">
              Tendências simbólicas construídas a partir do seu mapa natal e dos trânsitos reais de cada ciclo.
            </p>
          </div>
          {periodo && (
            <div className="flex items-center gap-4 self-start rounded-xl border border-veu/10 bg-surface-container-high px-4 py-2.5 md:self-auto md:px-5 md:py-3">
              <span className="material-symbols-outlined text-secondary">calendar_today</span>
              <div className="text-right">
                <p className="font-label text-[10px] uppercase text-outline">Período atual</p>
                <p className="font-label text-sm text-on-surface">{formatarIntervalo(periodo.inicio, periodo.fim)}</p>
              </div>
            </div>
          )}
        </header>

        <nav className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 xs:-mx-5 xs:px-5 md:mx-0 md:mb-8 md:gap-3 md:px-0" aria-label="Periodicidade do horóscopo">
          {PERIODOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selecionarPeriodo(item.id)}
              aria-pressed={periodoAtivo === item.id}
              className={`flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2.5 font-label text-sm transition-all md:px-5 md:py-3 ${
                periodoAtivo === item.id
                  ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_18px_rgb(var(--c-primary-container)/.12)]'
                  : 'border-veu/10 bg-veu/[.03] text-on-surface-variant hover:border-secondary/30 hover:text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icone}</span>
              {item.rotulo}
            </button>
          ))}
        </nav>

        {erro && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-error/30 bg-error/10 px-5 py-4 text-sm text-error">
            <span>{erro}</span>
            {!horoscopo && (
              <Button size="sm" variant="outline" onClick={() => gerarPeriodo(periodoAtivo)}>Tentar novamente</Button>
            )}
          </div>
        )}

        {estaGerando && !horoscopo ? (
          <GlassPanel className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center animate-pulse md:min-h-[380px] md:p-10">
            <span className="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
            <h2 className="mt-5 font-headline text-2xl">Interpretando seu ciclo</h2>
            <p className="mt-2 max-w-md text-on-surface-variant">Cruzando os trânsitos do período com as posições do seu mapa principal.</p>
          </GlassPanel>
        ) : horoscopo ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 orbis-cascata">
            <GlassCard magnetic className="flex animate-fade-in-up flex-col gap-5 rounded-2xl p-5 md:col-span-8 md:flex-row md:gap-6 md:p-7">
              <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl md:aspect-square md:h-auto bg-[radial-gradient(circle_at_center,rgb(var(--c-primary)/.18),rgb(var(--c-surface-container)/.7)_65%)] md:w-1/3">
                <div className="absolute h-32 w-32 animate-pulse rounded-full border border-secondary/30" />
                <div className="absolute h-48 w-48 rounded-full border border-primary/10" />
                <span className="material-symbols-outlined text-[76px] text-primary/60">auto_awesome</span>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-outline">{PERIODOS.find((item) => item.id === periodoAtivo)?.rotulo}</p>
                  <h2 className="mt-1 font-headline text-2xl text-secondary">{horoscopo.titulo}</h2>
                </div>
                <p className="leading-relaxed text-on-surface">{horoscopo.resumo}</p>
                <div className="rounded-xl border border-primary/15 bg-primary/[.06] p-4">
                  <p className="mb-1 font-label text-xs uppercase tracking-widest text-primary">Conselho do ciclo</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{horoscopo.conselho}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {horoscopo.palavras_chave.map((palavra) => (
                    <span key={palavra} className="rounded-full border border-secondary/20 bg-secondary-container/10 px-3 py-1 font-label text-xs text-secondary">{palavra}</span>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard magnetic className="space-y-5 rounded-2xl p-5 md:col-span-4 md:space-y-6 md:p-6">
              <h3 className="font-label text-sm uppercase tracking-widest text-outline">Medidores do ciclo</h3>
              {horoscopo.areas.map((area) => {
                const visual = AREAS[area.nome] || AREAS['Bem-estar']
                return (
                  <div key={area.nome} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-label text-sm text-on-surface">
                        <span className="material-symbols-outlined text-lg text-primary">{visual.icone}</span>
                        {area.nome}
                      </span>
                      <span className="font-label text-xs text-primary">{area.energia}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-veu/5">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${area.energia}%`,
                          background: `linear-gradient(90deg, ${visual.cor}80, ${visual.cor})`,
                          boxShadow: `0 0 10px ${visual.cor}60`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </GlassCard>

            {horoscopo.areas.map((area, index) => {
              const visual = AREAS[area.nome] || AREAS['Bem-estar']
              const tendencia = area.tendencia || 'estavel'
              return (
                <GlassCard
                  key={area.nome}
                  magnetic
                  className="group rounded-2xl p-5 transition-all duration-500 md:p-6 lg:hover:-translate-y-1 hover:border-primary/30 md:col-span-4"
                  style={{ animationDelay: `${150 + index * 100}ms` }}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary-container/10 transition-transform group-hover:scale-110">
                      <span className="material-symbols-outlined text-3xl text-primary">{visual.icone}</span>
                    </div>
                    <span className="rounded bg-surface-container-highest px-2 py-1 font-label text-[10px] uppercase text-outline">{tendencia}</span>
                  </div>
                  <h3 className="mb-3 font-headline text-xl">{area.nome}</h3>
                  <p className="text-sm leading-relaxed md:min-h-20 text-on-surface-variant">{area.texto}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-veu/5 pt-4">
                    <span className="font-label text-xs text-tertiary">Energia simbólica: {area.energia}%</span>
                    <span className={`material-symbols-outlined ${tendencia === 'baixa' ? 'text-error' : tendencia === 'alta' ? 'text-primary' : 'text-outline'}`}>
                      {ICONES_TENDENCIA[tendencia] || ICONES_TENDENCIA.estavel}
                    </span>
                  </div>
                </GlassCard>
              )
            })}

            <GlassCard magnetic className="rounded-2xl p-5 md:col-span-12 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-outline">Destaque astral considerado</p>
                  <p className="mt-2 font-headline text-xl text-secondary">{horoscopo.destaque_astral}</p>
                </div>
                <div className="max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-right">
                  {horoscopo.aviso || dados.aviso}
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassPanel className="p-6 text-center md:p-10">
            <p className="text-on-surface-variant">Este ciclo ainda não foi interpretado.</p>
            <Button className="mx-auto mt-5" onClick={() => gerarPeriodo(periodoAtivo)}>Gerar horóscopo</Button>
          </GlassPanel>
        )}
      </div>
    </Layout>
  )
}
