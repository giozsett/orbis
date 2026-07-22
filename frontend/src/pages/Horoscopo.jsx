import Layout from '../components/layout/Layout'
import GlassPanel from '../components/ui/GlassPanel'

const ENERGY_DATA = [
  { label: 'Amor', icon: 'favorite', value: 82, color: '#ffb1c3' },
  { label: 'Trabalho', icon: 'work', value: 45, color: '#deb7ff' },
  { label: 'Saúde', icon: 'health_and_safety', value: 67, color: '#eab9ce' },
]

const FORECASTS = [
  {
    titulo: 'Amor',
    icon: 'favorite',
    tipo: 'Diário',
    descricao: 'Clareza emocional em alta. Se estiver em um relacionamento, aproveite para discutir planos futuros. Solteiros podem sentir uma conexão forte com alguém do passado.',
    compatibilidade: 'Escorpião',
    trend: 'up',
  },
  {
    titulo: 'Trabalho',
    icon: 'bolt',
    tipo: 'Semanal',
    descricao: 'Mercúrio influencia sua comunicação técnica. Ótimo momento para apresentar projetos ou resolver pendências burocráticas que estavam travadas.',
    pico: '14:00',
    trend: 'neutral',
  },
  {
    titulo: 'Saúde',
    icon: 'self_improvement',
    tipo: 'Foco',
    descricao: 'Sua vitalidade física está estável, mas a mente pede descanso. Práticas meditativas e contato com a natureza serão fundamentais para recarregar as baterias.',
    recomendacao: 'Yoga',
    trend: 'down',
  },
]

const WEEKLY = [
  { dia: 'SEG', value: 40 },
  { dia: 'TER', value: 90, highlight: true },
  { dia: 'QUA', value: 65 },
  { dia: 'QUI', value: 55 },
  { dia: 'SEX', value: 80 },
  { dia: 'SAB', value: 30 },
  { dia: 'DOM', value: 20 },
]

export default function Horoscopo() {
  return (
    <Layout>
      <div className="p-6 md:p-16 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-6 mb-8 animate-fade-in-up">
          <div className="space-y-2">
            <span className="font-label text-xs text-tertiary tracking-[0.2em] uppercase">Mapa Astral Personalizado</span>
            <h1 className="font-headline text-4xl md:text-5xl text-on-surface">Horóscopo do Seu Mapa</h1>
            <p className="text-on-surface-variant max-w-xl">
              Sua jornada cósmica interpretada em tempo real através da posição atual dos astros sobre a sua assinatura estelar de nascimento.
            </p>
          </div>
          <div className="bg-surface-container-high px-6 py-3 rounded-xl border border-white/10 flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary">calendar_today</span>
            <div className="text-right">
              <p className="font-label text-[10px] text-outline uppercase">Ciclo Atual</p>
              <p className="font-label text-sm text-on-surface">Lua Crescente em Touro</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Conselho principal */}
          <GlassPanel className="md:col-span-8 rounded-2xl p-6 flex flex-col md:flex-row gap-6 animate-fade-in-up">
            <div className="w-full md:w-1/3 aspect-square relative rounded-xl overflow-hidden bg-surface-container">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[80px] text-primary/30">auto_awesome</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h2 className="font-headline text-xl text-secondary">Conselho dos Astros</h2>
              </div>
              <p className="text-on-surface leading-relaxed">
                "A oposição de Vênus com seu Saturno natal pede paciência nas negociações. Hoje não é dia de pressa, mas de consolidar as bases. Ouça mais e fale menos; o silêncio será seu maior aliado nas decisões de longo prazo."
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-tertiary-container/20 text-tertiary font-label text-xs px-3 py-1 rounded-full border border-tertiary/20">Foco Profissional</span>
                <span className="bg-secondary-container/20 text-secondary font-label text-xs px-3 py-1 rounded-full border border-secondary/20">Prudência</span>
                <span className="bg-primary-container/20 text-primary font-label text-xs px-3 py-1 rounded-full border border-primary/20">Alta Energia</span>
              </div>
            </div>
          </GlassPanel>

          {/* Medidores de energia */}
          <div className="md:col-span-4 space-y-6">
            <GlassPanel className="rounded-2xl p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h3 className="font-label text-sm text-outline uppercase tracking-widest">Medidores de Energia</h3>
              {ENERGY_DATA.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-label text-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="font-label text-xs text-primary">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1500 ease-out"
                      style={{
                        width: `${item.value}%`,
                        background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                        boxShadow: `0 0 10px ${item.color}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </GlassPanel>
          </div>

          {/* Cards de previsão */}
          {FORECASTS.map((item, index) => (
            <GlassPanel
              key={item.titulo}
              className="md:col-span-4 rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 cursor-pointer group animate-fade-in-up"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">{item.icon}</span>
                </div>
                <span className="text-[10px] font-label text-outline bg-surface-container-highest px-2 py-1 rounded">{item.tipo}</span>
              </div>
              <h4 className="font-headline text-xl mb-4">{item.titulo}</h4>
              <p className="text-on-surface-variant text-sm mb-6">{item.descricao}</p>
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <span className="text-tertiary font-label text-xs">
                  {item.compatibilidade && `Compatibilidade: ${item.compatibilidade}`}
                  {item.pico && `Pico de Produtividade: ${item.pico}`}
                  {item.recomendacao && `Recomendação: ${item.recomendacao}`}
                </span>
                <span className={`material-symbols-outlined ${
                  item.trend === 'up' ? 'text-primary' : item.trend === 'down' ? 'text-error' : 'text-outline'
                }`}>
                  {item.trend === 'up' ? 'trending_up' : item.trend === 'down' ? 'trending_down' : 'horizontal_rule'}
                </span>
              </div>
            </GlassPanel>
          ))}

          {/* Transitosemana */}
          <GlassPanel className="md:col-span-12 rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-2xl">Transitos da Semana</h3>
              <div className="flex gap-2">
                <button className="p-2 border border-white/10 rounded hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 border border-white/10 rounded hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {WEEKLY.map((item) => (
                <div key={item.dia} className="flex flex-col items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                  <span className={`font-label text-xs ${item.highlight ? 'text-secondary' : 'text-outline'}`}>{item.dia}</span>
                  <div className="w-2 h-24 bg-surface-container rounded-full relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-1000"
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                  <span className="font-label text-sm text-on-surface">{item.value}%</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </Layout>
  )
}
