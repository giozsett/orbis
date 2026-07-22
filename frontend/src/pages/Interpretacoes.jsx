import Layout from '../components/layout/Layout'
import GlassCard from '../components/ui/GlassCard'

const INTERPRETACOES = [
  {
    planeta: 'Sol',
    icon: 'wb_sunny',
    signo: 'Leão',
    casa: 'V',
    interpretacao: 'A vitalidade central está focada na autoexpressão criativa. Há uma necessidade potente de ser reconhecido por seus talentos únicos, impulsionando a confiança e a liderança generosa em projetos pessoais.',
    dignidade: 'Domicílio',
    elemento: 'Fogo',
    color: '#ffb1c3',
  },
  {
    planeta: 'Lua',
    icon: 'dark_mode',
    signo: 'Touro',
    casa: 'II',
    interpretacao: 'Busca por segurança emocional através da estabilidade material e conforto sensorial. As reações são calmas, mas persistentes, focadas na preservação do que é valioso e nutritivo.',
    dignidade: 'Exaltação',
    elemento: 'Terra',
    color: '#deb7ff',
  },
  {
    planeta: 'Mercúrio',
    icon: 'auto_awesome_motion',
    signo: 'Virgem',
    casa: 'VI',
    interpretacao: 'O intelecto opera em alta frequência. A comunicação é ágil, versátil e orientada para a troca rápida de informações. Excelente período para aprendizado, escrita e conexões locais.',
    dignidade: 'Domicílio',
    estado: 'Direto',
    color: '#eab9ce',
  },
  {
    planeta: 'Vênus',
    icon: 'favorite',
    signo: 'Libra',
    casa: 'VII',
    interpretacao: 'O foco recai sobre a harmonia nos relacionamentos. Busca-se o equilíbrio estético e a diplomacia em parcerias. O desejo por justiça e beleza nas interações sociais é o principal motivador.',
    dignidade: 'Domicílio',
    elemento: 'Ar',
    color: '#ff4b89',
  },
  {
    planeta: 'Marte',
    icon: 'local_fire_department',
    signo: 'Áries',
    casa: 'I',
    interpretacao: 'Ação pura e impulsiva. A energia vital é direcionada para o início de novos ciclos e a conquista de autonomia. Coragem física e iniciativa estão em seu auge operativo.',
    dignidade: 'Domicílio',
    impacto: 'Alto',
    color: '#ffb4ab',
  },
  {
    planeta: 'Júpiter',
    icon: 'expand_circle_up',
    signo: 'Sagitário',
    casa: 'IX',
    interpretacao: 'Expansão de consciência e otimismo filosófico. Há um forte desejo por exploração de novos horizontes, sejam eles geográficos ou intelectuais. Sorte através da fé e do conhecimento.',
    dignidade: 'Domicílio',
    qualidade: 'Benéfico',
    color: '#b86dfd',
  },
]

export default function Interpretacoes() {
  return (
    <Layout>
      <div className="p-6 md:p-16 min-h-screen">
        <header className="mb-12 max-w-4xl animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-12 bg-primary" />
            <span className="font-label text-xs text-primary uppercase tracking-[0.2em]">Interpretação Estelar</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4">Posições Planetárias</h1>
          <p className="text-lg text-on-surface-variant/80 max-w-2xl">
            Análise técnica detalhada das coordenadas celestiais e suas influências vibracionais no momento atual. Explore o impacto de cada regente em sua respectiva casa.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {INTERPRETACOES.map((item, index) => (
            <GlassCard
              key={item.planeta}
              magnetic
              className="p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Ícone decorativo */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined" style={{ fontSize: '80px', color: item.color, fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              </div>

              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-lg border" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-label text-xs text-outline uppercase">Posição</div>
                  <div className="font-label text-sm text-secondary">{item.signo}, Casa {item.casa}</div>
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <h2 className="font-headline text-2xl mb-2">{item.planeta}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.interpretacao}</p>
              </div>

              {/* Metadados */}
              <div className="mt-auto pt-6 border-t border-white/5 flex gap-4">
                <div className="flex flex-col">
                  <span className="font-label text-xs text-outline">Dignidade</span>
                  <span className="font-label text-sm" style={{ color: item.color }}>{item.dignidade}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-xs text-outline">{item.elemento ? 'Elemento' : item.estado ? 'Estado' : 'Qualidade'}</span>
                  <span className="font-label text-sm" style={{ color: item.color }}>{item.elemento || item.estado || item.qualidade}</span>
                </div>
              </div>
            </GlassCard>
          ))}

          {/* Divisor animado */}
          <div className="col-span-1 md:col-span-2 xl:col-span-3 h-64 glass-panel rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="relative z-10 text-center">
              <p className="font-label text-xs text-primary uppercase tracking-[0.4em] mb-2">Fluxo de Energia Planetária</p>
              <p className="font-headline text-2xl text-on-surface">Alinhamento Quântico Ativo</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
