import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import GlassCard from '../components/ui/GlassCard'
import useMapaPrincipal from '../hooks/useMapaPrincipal'
import { visualPlaneta } from '../utils/mapVisuals'

export default function Retrogrados() {
  const { mapa, erro } = useMapaPrincipal()
  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa?.dados) return <CelestialLoading texto="Verificando movimentos retrógrados" />
  const retrogrados = mapa.dados.planetas.filter((planeta) => planeta.retrogrado)

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12 xl:p-16">
        <TechnicalHeader mapa={mapa} eyebrow="Retrogrades" titulo="Movimentos Retrógrados" icone="settings_backup_restore" descricao="Corpos que aparentavam mover-se para trás no momento do nascimento, apresentados como convites simbólicos à revisão e interiorização." />
        {retrogrados.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{retrogrados.map((planeta, index) => { const visual = visualPlaneta(planeta.nome); return <GlassCard key={planeta.nome} magnetic className="group overflow-hidden p-6 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}><div className="flex items-center justify-between"><span className="material-symbols-outlined animate-rotate-reverse text-5xl" style={{ color: visual.color }}>{visual.icon}</span><span className="rounded-full border border-error/30 bg-error/10 px-3 py-1 font-label text-[10px] uppercase text-error">Retrógrado</span></div><h2 className="mt-6 font-headline text-2xl">{planeta.nome} em {planeta.signo}</h2><p className="mt-2 font-label text-xs text-secondary">Casa {planeta.casa} · {planeta.posicao}</p><p className="mt-5 text-sm leading-relaxed text-on-surface-variant">{planeta.interpretacao_base?.planeta} {planeta.interpretacao_base?.signo}</p></GlassCard>})}</div> : <GlassCard className="relative flex min-h-[420px] animate-scale-in flex-col items-center justify-center overflow-hidden p-10 text-center"><div className="absolute h-64 w-64 animate-rotate-slow rounded-full border border-dashed border-primary/20" /><div className="absolute h-40 w-40 animate-rotate-reverse rounded-full border border-secondary/20" /><span className="material-symbols-outlined relative z-10 text-7xl text-primary">check_circle</span><h2 className="relative z-10 mt-6 font-headline text-3xl">Todos em movimento direto</h2><p className="relative z-10 mt-3 max-w-lg text-on-surface-variant">Nenhum dos corpos calculados estava retrógrado no seu mapa natal. A tela continuará acompanhando somente a configuração de nascimento, não trânsitos atuais.</p></GlassCard>}
      </div>
    </Layout>
  )
}
