import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Mandala from '../components/mandala/Mandala'
import PlanetCard from '../components/planet/PlanetCard'
import GlassCard from '../components/ui/GlassCard'
import EsferaArmilar from '../components/ui/EsferaArmilar'
import TituloMoldurado from '../components/ui/TituloMoldurado'
import { CelestialError, CelestialLoading } from '../components/map/CelestialPageState'
import ArcanoCard from '../components/arcano/ArcanoCard'
import ArcanoDetalhes from '../components/arcano/ArcanoDetalhes'
import { selecionarMapa } from '../hooks/useMapaSelecionado'

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
      color: '#ffb1c3',
    },
    {
      titulo: 'Lua em Touro',
      subtitulo: 'EMOÇÕES',
      casa: 'Casa II • 02° 11',
      descricao: 'Suas necessidades emocionais estão ancoradas na estabilidade e no prazer sensorial. Conforto é fundamental.',
      icon: 'nightlight',
      color: '#eab9ce',
    },
    {
      titulo: 'Asc. Escorpião',
      subtitulo: 'PERSONA',
      casa: 'Horizonte Leste • 28° 45',
      descricao: 'Uma presença magnética e intensa. O mundo o vê como alguém profundo, reservado e altamente perceptivo.',
      icon: 'expand_less',
      color: '#ffb1c3',
    },
  ],
}

export default function MapaPrincipal() {
  const [hoveredPlanet, setHoveredPlanet] = useState(null)
  const [mapa, setMapa] = useState(null)
  const [erro, setErro] = useState('')
  const [arcanoAberto, setArcanoAberto] = useState(false)
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
      { ponto: sol, subtitulo: 'IDENTIDADE', icon: 'sunny', color: '#ffb1c3' },
      { ponto: lua, subtitulo: 'EMOÇÕES', icon: 'nightlight', color: '#eab9ce' },
      { ponto: ascendente, subtitulo: 'PERSONA', icon: 'expand_less', color: '#deb7ff' },
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
      <div className="p-6 md:p-16 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
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
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroCards.map((card, index) => (
              <GlassCard
                key={card.titulo}
                magnetic
                className="p-6 relative overflow-hidden group motion-safe:animate-orbis-rise"
                style={{ animationDelay: `${560 + index * 130}ms` }}
              >
                <div
                  className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-500"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '80px', color: card.color }}>
                    {card.icon}
                  </span>
                </div>

                <p className="font-label text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: card.color }}>{card.subtitulo}</p>
                <h2 className="font-headline text-2xl mb-1">{card.titulo}</h2>
                <p className="font-label text-xs text-outline">{card.casa}</p>

                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                  Posição calculada para {mapa.local_nascimento} no sistema Placidus.
                </p>
              </GlassCard>
            ))}
          </section>

          {mapa.arcano_pessoal && (
            <ArcanoCard arcano={mapa.arcano_pessoal} onExplorar={() => setArcanoAberto(true)} />
          )}

          {/* Área principal: Mandala & Lista */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Mandala sobre a esfera armilar, como o card de autenticação no login */}
            <div className="xl:col-span-7 relative flex justify-center items-center py-6">
              <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(125%,760px)] -translate-x-1/2 -translate-y-1/2 opacity-20">
                <div className="motion-safe:animate-orbis-float">
                  <EsferaArmilar animada className="w-full motion-safe:animate-orbis-sphere-in" />
                </div>
              </div>
              <div className="relative w-full max-w-[600px] aspect-square">
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
                className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.08] bg-surface-container-low/50 px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.18em] text-outline backdrop-blur-sm motion-safe:animate-orbis-swap"
              >
                {hoveredPlanet ? `${hoveredPlanet.nome} · ${hoveredPlanet.signo} · ${hoveredPlanet.posicao}` : 'passe o cursor sobre um planeta'}
              </p>
            </div>

            {/* Lista de planetas */}
            <div className="xl:col-span-5 space-y-4">
              <div className="glass-card rounded-2xl overflow-hidden mb-6 motion-safe:animate-orbis-rise" style={{ animationDelay: '700ms' }}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
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
        <ArcanoDetalhes arcano={mapa.arcano_pessoal} aberto={arcanoAberto} onFechar={() => setArcanoAberto(false)} />
      </div>
    </Layout>
  )
}
