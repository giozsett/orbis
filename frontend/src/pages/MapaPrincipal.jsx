import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Mandala from '../components/mandala/Mandala'
import PlanetCard from '../components/planet/PlanetCard'
import GlassCard from '../components/ui/GlassCard'

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

  return (
    <Layout>
      <div className="p-6 md:p-16 min-h-screen">
        {/* Nebulosa de fundo */}
        <div className="fixed top-1/4 left-1/4 w-[300px] h-[300px] bg-primary-container/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          {/* Hero Cards: Sol, Lua, Ascendente */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_DATA.heroCards.map((card, index) => (
              <GlassCard
                key={card.titulo}
                magnetic
                className="p-6 relative overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div
                  className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-500"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '80px', color: card.color }}>
                    {card.icon}
                  </span>
                </div>

                <p className="font-label text-xs mb-2" style={{ color: card.color }}>{card.subtitulo}</p>
                <h2 className="font-headline text-2xl mb-1">{card.titulo}</h2>
                <p className="font-label text-xs text-primary-fixed-dim">{card.casa}</p>

                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">{card.descricao}</p>
              </GlassCard>
            ))}
          </section>

          {/* Área principal: Mandala & Lista */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Mandala */}
            <div className="xl:col-span-7 flex justify-center items-center py-6">
              <div className="w-full max-w-[600px] aspect-square">
                <Mandala
                  data={MOCK_DATA}
                  animated={true}
                  onPlanetHover={setHoveredPlanet}
                  onPlanetClick={(p) => console.log('Planeta clicado:', p)}
                />
              </div>
            </div>

            {/* Lista de planetas */}
            <div className="xl:col-span-5 space-y-4">
              <div className="glass-card rounded-xl overflow-hidden mb-6">
                <div className="p-4 bg-surface-variant/20 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-headline text-xl">Posições Planetárias</h3>
                  <span className="material-symbols-outlined text-outline">info</span>
                </div>
              </div>

              {MOCK_DATA.planetas.map((planeta, index) => (
                <PlanetCard
                  key={planeta.nome}
                  planeta={planeta}
                  index={index}
                />
              ))}

              {/* Insight do dia */}
              <GlassCard magnetic className="p-6 border-primary/20 bg-primary/5">
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
