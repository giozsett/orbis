import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Mandala from '../components/mandala/Mandala'
import PlanetCard from '../components/planet/PlanetCard'
import GlassCard from '../components/ui/GlassCard'
import TituloMoldurado from '../components/ui/TituloMoldurado'
import { CelestialError, CelestialLoading } from '../components/map/CelestialPageState'
import ArcanoCard from '../components/arcano/ArcanoCard'
import { selecionarMapa } from '../hooks/useMapaSelecionado'
import { corTema } from '../utils/tema'

// Mesmas cores e traços usados na mandala: [aspecto, cor, tracejado]
const LEGENDA_ASPECTOS = [
  ['conjunção', '#ffd16a', false],
  ['sextil', '#9cc4ff', false],
  ['trígono', '#87dfd8', false],
  ['quadratura', '#ff4b89', true],
  ['oposição', '#ff897d', true],
]

const MOCK_DATA = {
  planetas: [
    {
      nome: 'Sol',
      signo: 'Leão',
      casa: 'V',
      grau: 15,
      posicao: "15° 24'",
      interpretacao: 'Sua essência brilha com criatividade e autoconfiança. A busca por expressão pessoal é o motor de sua jornada.',
      dignidade: 'Domicílio',
      elemento: 'Fogo',
      aspectos: [{ tipo: 'trígono', planeta: 'Júpiter' }],
    },
    {
      nome: 'Lua',
      signo: 'Touro',
      casa: 'II',
      grau: 2,
      posicao: "02° 11'",
      interpretacao: 'Suas necessidades emocionais estão ancoradas na estabilidade e no prazer sensorial. Conforto é fundamental.',
      dignidade: 'Exaltação',
      elemento: 'Terra',
      aspectos: [],
    },
    {
      nome: 'Mercúrio',
      signo: 'Virgem',
      casa: 'VI',
      grau: 12,
      posicao: "12° 50' R",
      interpretacao: 'O intelecto opera em alta frequência. A comunicação é ágil, versátil e orientada para a troca rápida de informações.',
      dignidade: 'Domicílio',
      estado: 'Retrogrado',
      aspectos: [{ tipo: 'quadratura', planeta: 'Saturno' }],
    },
    {
      nome: 'Vênus',
      signo: 'Câncer',
      casa: 'IV',
      grau: 27,
      posicao: "27° 05'",
      interpretacao: 'O foco recai sobre a harmonia nos relacionamentos. Busca-se o equilíbrio estético e a diplomacia em parcerias.',
      dignidade: 'Domicílio',
      elemento: 'Água',
      aspectos: [{ tipo: 'oposição', planeta: 'Saturno' }],
    },
    {
      nome: 'Marte',
      signo: 'Áries',
      casa: 'I',
      grau: 9,
      posicao: "09° 33'",
      interpretacao: 'Ação pura e impulsiva. A energia vital é direcionada para o início de novos ciclos e a conquista de autonomia.',
      dignidade: 'Domicílio',
      elemento: 'Fogo',
      aspectos: [],
    },
    {
      nome: 'Júpiter',
      signo: 'Gêmeos',
      casa: 'III',
      grau: 19,
      posicao: "19° 12'",
      interpretacao: 'Expansão de consciência e otimismo filosófico. Há um forte desejo por exploração de novos horizontes.',
      qualidade: 'Benéfico',
      aspectos: [{ tipo: 'trígono', planeta: 'Sol' }],
    },
  ],
  heroCards: [
    {
      titulo: 'Sol em Leão',
      subtitulo: 'IDENTIDADE',
      casa: 'Casa V • 15° 24',
      descricao: 'Sua essência brilha com criatividade e autoconfiança. A busca por expressão pessoal é o motor de sua jornada.',
      icon: 'sunny',
      color: '#a9b8ff',
    },
    {
      titulo: 'Lua em Touro',
      subtitulo: 'EMOÇÕES',
      casa: 'Casa II • 02° 11',
      descricao: 'Suas necessidades emocionais estão ancoradas na estabilidade e no prazer sensorial. Conforto é fundamental.',
      icon: 'nightlight',
      color: '#e0b96e',
    },
    {
      titulo: 'Asc. Escorpião',
      subtitulo: 'PERSONA',
      casa: 'Horizonte Leste • 28° 45',
      descricao: 'Uma presença magnética e intensa. O mundo o vê como alguém profundo, reservado e altamente perceptivo.',
      icon: 'expand_less',
      color: '#a9b8ff',
    },
  ],
}

export default function MapaPrincipal() {
  const [hoveredPlanet, setHoveredPlanet] = useState(null)
  const [mapa, setMapa] = useState(null)
  const [erro, setErro] = useState('')
  const { id } = useParams()

  useEffect(() => {
    const endpoint = id ? `/mapas/${id}` : '/mapas/principal'
    fetch(endpoint, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(async response => {
        if (response.status === 401) {
          window.location.assign('/login')
          return
        }
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.mapa) {
          throw new Error(data?.erro || 'Não foi possível carregar o mapa.')
        }
        setMapa(data.mapa)
        selecionarMapa(data.mapa.id)
      })
      .catch(error => setErro(error.message))
  }, [id])

  const chartData = mapa?.dados
  const heroCards = useMemo(() => {
    if (!chartData) return []
    const sol = chartData.planetas.find(planeta => planeta.nome === 'Sol')
    const lua = chartData.planetas.find(planeta => planeta.nome === 'Lua')
    const ascendente = chartData.ascendente
    return [
      { ponto: sol, subtitulo: 'IDENTIDADE', icon: 'sunny', color: '#ffd16a' },
      { ponto: lua, subtitulo: 'EMOÇÕES', icon: 'nightlight', color: '#d9c5ff' },
      { ponto: ascendente, subtitulo: 'PERSONA', icon: 'expand_less', color: '#c3a6ff' },
    ].filter(item => item.ponto).map(item => ({
      ...item,
      titulo: `${item.ponto.nome} em ${item.ponto.signo}`,
      casa: item.ponto.casa ? `Casa ${item.ponto.casa} • ${item.ponto.posicao}` : item.ponto.posicao,
    }))
  }, [chartData])

  if (erro) return <CelestialError mensagem={erro} />
  if (!chartData) return <CelestialLoading texto="Traçando seu mapa natal" />

  return (
    <Layout>
      <div className="p-4 xs:p-5 md:p-16">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">
          {/* Cabeçalho no mesmo ritmo do hero do login */}
          <header>
            <p className="mb-5 font-label text-[11px] uppercase tracking-[0.32em] text-primary motion-safe:animate-orbis-rise sm:text-xs" style={{ animationDelay: '150ms' }}>
              Mapa natal · {mapa.local_nascimento}
            </p>
            <TituloMoldurado style={{ animationDelay: '280ms' }}>{mapa.nome || 'Mapa natal'}</TituloMoldurado>
            <p className="ml-1 mt-5 font-label text-sm italic tracking-[0.08em] text-outline motion-safe:animate-orbis-rise" style={{ animationDelay: '430ms' }}>
              o céu no instante em que você nasceu
            </p>
          </header>

          {/* Hero Cards: Sol, Lua, Ascendente */}
          <section className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 xs:-mx-5 xs:px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {heroCards.map((card, index) => (
              <GlassCard
                key={card.titulo}
                magnetic
                className="relative w-[80%] shrink-0 snap-center overflow-hidden p-5 group motion-safe:animate-orbis-rise xs:w-[76%] md:w-auto md:p-6"
                style={{ animationDelay: `${560 + index * 130}ms` }}
              >
                <div
                  className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-500"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '80px', color: corTema(card.color) }}>
                    {card.icon}
                  </span>
                </div>

                <p className="font-label text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: corTema(card.color) }}>{card.subtitulo}</p>
                <h2 className="font-headline text-2xl mb-1">{card.titulo}</h2>
                <p className="font-dados text-xs text-outline">{card.casa}</p>

                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                  Posição calculada para {mapa.local_nascimento} no sistema Placidus.
                </p>
              </GlassCard>
            ))}
          </section>

          {mapa.arcano_pessoal && (
            <Link to="/arcanos" className="group flex items-center gap-3 motion-safe:animate-orbis-rise sm:max-w-md" style={{ animationDelay: '950ms' }}>
              <div className="min-w-0 flex-1 [&>.arcano-mini]:mt-0"><ArcanoCard arcano={mapa.arcano_pessoal} compacta /></div>
              <span className="material-symbols-outlined text-outline transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          )}

          {/* Área principal: Mandala & Lista */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start orbis-cascata">
            {/* Mandala sobre um halo suave (sem ilustração atrás, para não disputar com as posições) */}
            <div className="xl:col-span-7 relative flex flex-col justify-center items-center gap-4 py-2 md:gap-5 md:py-6">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-container/10 blur-[90px] motion-safe:animate-orbis-twinkle" />
              <div className="relative w-full max-w-[640px] aspect-square">
                {/* key reinicia a coreografia de entrada ao trocar de mapa */}
                <Mandala
                  key={mapa.id}
                  data={chartData}
                  animated={true}
                  onPlanetHover={setHoveredPlanet}
                  onPlanetClick={(p) => console.log('Planeta clicado:', p)}
                />
              </div>
              <p
                key={hoveredPlanet?.nome || 'dica'}
                className="relative rounded-full border border-veu/[0.08] bg-surface-container-low/50 px-3.5 py-1.5 text-center font-dados text-[10px] uppercase tracking-[0.18em] text-outline backdrop-blur-sm motion-safe:animate-orbis-swap"
              >
                {hoveredPlanet
                  ? `${hoveredPlanet.nome} · ${hoveredPlanet.signo} ${hoveredPlanet.posicao}${hoveredPlanet.casa ? ` · Casa ${hoveredPlanet.casa}` : ''}${hoveredPlanet.retrogrado ? ' · retrógrado' : ''}`
                  : <><span className="[@media(hover:none)]:hidden">passe o cursor sobre um planeta</span><span className="hidden [@media(hover:none)]:inline">toque em um planeta</span></>}
              </p>
              <ul className="relative flex flex-wrap justify-center gap-x-4 gap-y-2 font-label text-[10px] uppercase tracking-[0.14em] text-outline" aria-label="Legenda dos aspectos">
                {LEGENDA_ASPECTOS.map(([tipo, cor, tracejado]) => (
                  <li key={tipo} className="flex items-center gap-1.5">
                    <svg width="18" height="4" aria-hidden="true"><line x1="0" y1="2" x2="18" y2="2" stroke={corTema(cor)} strokeWidth="2" strokeDasharray={tracejado ? '4 3' : undefined} /></svg>
                    {tipo}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lista de planetas */}
            <div className="xl:col-span-5 space-y-4">
              <div className="glass-card rounded-2xl overflow-hidden mb-6 motion-safe:animate-orbis-rise" style={{ animationDelay: '700ms' }}>
                <div className="p-4 border-b border-veu/5 flex justify-between items-center">
                  <h3 className="font-headline text-xl">Posições Planetárias</h3>
                  <span className="material-symbols-outlined text-primary motion-safe:animate-orbis-twinkle">auto_awesome</span>
                </div>
              </div>

              {chartData.planetas.map((planeta, index) => (
                <PlanetCard
                  key={planeta.nome}
                  planeta={planeta}
                  index={index}
                  atraso={800}
                />
              ))}

              {/* Insight do dia */}
              <GlassCard magnetic className="p-6 border-primary/20 motion-safe:animate-orbis-rise" style={{ animationDelay: `${900 + chartData.planetas.length * 80}ms` }}>
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-lg mb-2">Insight do Dia</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      O trígono entre seu Sol natal e Júpiter em trânsito hoje favorece expansão criativa. Momento ideal para lançar projetos que exigem visibilidade.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
