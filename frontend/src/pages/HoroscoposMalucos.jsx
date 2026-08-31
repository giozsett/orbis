import { useMemo } from 'react'
import Layout from '../components/layout/Layout'
import GlassCard from '../components/ui/GlassCard'
import LinuxTuxIcon from '../components/icons/LinuxTuxIcon'
import { CelestialLoading, CelestialError } from '../components/map/CelestialPageState'
import useMapaSelecionado from '../hooks/useMapaSelecionado'
import { obterHoroscopoMaluco } from '../data/horoscoposMalucos'

export default function HoroscoposMalucos() {
  const { mapa, cor, erro } = useMapaSelecionado()

  const resultado = useMemo(() => {
    if (!mapa?.dados?.planetas) return null
    const sol = mapa.dados.planetas.find((p) => p.nome === 'Sol')
    if (!sol?.signo) return null
    return obterHoroscopoMaluco(sol.signo)
  }, [mapa])

  const signoSolar = useMemo(() => {
    if (!mapa?.dados?.planetas) return null
    const sol = mapa.dados.planetas.find((p) => p.nome === 'Sol')
    return sol?.signo || null
  }, [mapa])

  if (erro) {
    return <CelestialError mensagem={erro} />
  }

  if (!mapa) {
    return <CelestialLoading texto="Preparando seu horóscopo maluco" />
  }

  if (!signoSolar || !resultado) {
    return (
      <Layout showFooter={false}>
        <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center p-8">
          <GlassCard className="max-w-lg animate-scale-in p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-outline">question_mark</span>
            <h1 className="mt-4 font-headline text-2xl">Signo solar não encontrado</h1>
            <p className="mt-3 text-on-surface-variant">
              Não foi possível identificar o Sol neste mapa. Verifique se o mapa possui dados planetários completos.
            </p>
          </GlassCard>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showFooter={false}>
      <div className="p-6 md:p-16 min-h-screen">
        <div className="fixed top-1/4 left-1/4 w-[300px] h-[300px] blur-[120px] rounded-full pointer-events-none" style={{ background: `${cor}08` }} />
        <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] blur-[120px] rounded-full pointer-events-none" style={{ background: `${cor}05` }} />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">

          {/* Hero temático */}
          <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low/60 p-7 md:p-10 animate-fade-in-up" style={{ borderColor: `${cor}25` }}>
            <div className="absolute -right-12 -top-12 h-48 w-48 animate-pulse-soft rounded-full blur-3xl" style={{ background: `${cor}15` }} />
            <div className="absolute right-7 top-7 animate-float-slow opacity-10">
              <LinuxTuxIcon size={80} />
            </div>
            <div className="relative z-10">
              <p className="font-label text-xs uppercase tracking-[0.22em]" style={{ color: cor }}>Dia do Horóscopo Maluco · {mapa.nome}</p>
              <h1 className="mt-3 font-headline text-4xl text-on-surface md:text-5xl">
                Qual distro do Linux você seria?
              </h1>
              <p className="mt-4 max-w-3xl leading-relaxed text-on-surface-variant">
                Baseado no seu Sol em {signoSolar}
              </p>
            </div>
          </header>

          {/* Carta de descoberta */}
          <GlassCard
            magnetic
            className="p-8 md:p-12 relative overflow-hidden group animate-fade-in-up delay-100"
            style={{ borderColor: `${cor}30` }}
          >
            <div className="absolute -right-16 -top-16 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <LinuxTuxIcon size={160} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full" style={{ background: `${cor}15` }}>
                  <LinuxTuxIcon size={32} />
                </div>
                <div>
                  <p className="font-label text-xs uppercase tracking-[0.2em]" style={{ color: cor }}>{resultado.familia}</p>
                  <h2 className="font-headline text-4xl md:text-5xl" style={{ color: cor }}>{resultado.distro}</h2>
                </div>
              </div>

              <p className="text-lg text-on-surface-variant leading-relaxed max-w-3xl">
                {resultado.descricao}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                {resultado.caracteristicas.map((caract) => (
                  <span
                    key={caract}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-[1.02]"
                    style={{ borderColor: `${cor}40`, background: `${cor}10`, color: cor }}
                  >
                    {caract}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Por que essa distro? */}
          <GlassCard className="p-6 md:p-8 animate-fade-in-up delay-200" style={{ borderColor: `${cor}20` }}>
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-full shrink-0" style={{ background: `${cor}15` }}>
                <span className="material-symbols-outlined" style={{ color: cor }}>psychology</span>
              </div>
              <div>
                <h3 className="font-headline text-lg mb-2">Por que essa distro?</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {resultado.observacao}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Troca de mapa */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low/40 border border-white/5 animate-fade-in-up delay-300">
            <span className="material-symbols-outlined text-outline">swap_horiz</span>
            <p className="text-sm text-on-surface-variant">
              Para ver outro resultado, abra <strong>Meus mapas</strong> na barra lateral e selecione um mapa diferente. A página atualiza automaticamente.
            </p>
          </div>

          {/* Aviso editorial */}
          <p className="text-xs text-outline text-center animate-fade-in delay-500">
            Conteúdo lúdico e editorial. Não constitui recomendação técnica de distribuição Linux, suporte ou orientação de segurança.
          </p>
        </div>
      </div>
    </Layout>
  )
}
