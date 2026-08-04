import { useMemo, useState } from 'react'

import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import GlassCard from '../components/ui/GlassCard'
import useMapaPrincipal from '../hooks/useMapaPrincipal'
import { ASPECT_VISUALS } from '../utils/mapVisuals'

const chave = (a, b) => [a, b].sort().join('|')

export default function Aspectos() {
  const { mapa, erro } = useMapaPrincipal()
  const [selecionado, setSelecionado] = useState(null)
  const grade = useMemo(() => new Map((mapa?.dados?.aspectos || []).map((aspecto) => [chave(aspecto.planeta1.nome, aspecto.planeta2.nome), aspecto])), [mapa])

  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa?.dados) return <CelestialLoading texto="Traçando grade de aspectos" />
  const planetas = mapa.dados.planetas.map((item) => item.nome)

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12 xl:p-16">
        <TechnicalHeader mapa={mapa} eyebrow="Aspect grid" titulo="Geometria Planetária" icone="grid_4x4" descricao="A matriz mostra as relações angulares encontradas entre os corpos do seu mapa natal. Selecione um símbolo para inspecionar o orbe." />
        <div className="grid gap-6 xl:grid-cols-[1fr_310px]">
          <GlassCard className="overflow-hidden animate-fade-in-up">
            <div className="custom-scrollbar overflow-auto p-3">
              <table className="mx-auto border-separate border-spacing-1">
                <thead><tr><th /><th colSpan={planetas.length} className="pb-3 font-label text-[10px] uppercase tracking-widest text-outline">Planeta relacionado</th></tr></thead>
                <tbody>
                  {planetas.map((linha, i) => (
                    <tr key={linha} className="animate-fade-in" style={{ animationDelay: `${i * 65}ms` }}>
                      <th className="whitespace-nowrap pr-3 text-right font-label text-[10px] text-on-surface-variant">{linha}</th>
                      {planetas.map((coluna, j) => {
                        const aspecto = grade.get(chave(linha, coluna))
                        const visual = aspecto && ASPECT_VISUALS[aspecto.tipo]
                        return (
                          <td key={coluna}>
                            <button disabled={!aspecto || i === j} onClick={() => setSelecionado(aspecto)} title={aspecto ? `${aspecto.tipo} · orbe ${aspecto.orbe}°` : ''} className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-all ${i === j ? 'border-primary/15 bg-primary/10' : aspecto ? 'hover:scale-110 hover:bg-white/10' : 'border-white/[.035] text-white/10'}`} style={aspecto ? { borderColor: `${visual.color}55`, color: visual.color } : undefined}>{i === j ? '·' : visual?.symbol || ''}</button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard magnetic className="relative min-h-64 overflow-hidden p-6 animate-slide-in-right">
            {selecionado ? (() => {
              const visual = ASPECT_VISUALS[selecionado.tipo] || { symbol: '·', color: '#ffb1c3' }
              return <div><span className="text-6xl" style={{ color: visual.color }}>{visual.symbol}</span><p className="mt-5 font-label text-xs uppercase tracking-widest text-outline">Aspecto selecionado</p><h2 className="mt-2 font-headline text-2xl capitalize">{selecionado.tipo}</h2><p className="mt-4 text-on-surface-variant">{selecionado.planeta1.nome} e {selecionado.planeta2.nome}</p><div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4"><span className="font-label text-xs text-outline">Orbe</span><p className="font-headline text-2xl" style={{ color: visual.color }}>{Number(selecionado.orbe).toFixed(2)}°</p></div></div>
            })() : <div className="flex h-full min-h-52 flex-col items-center justify-center text-center"><span className="material-symbols-outlined animate-pulse-soft text-6xl text-primary/40">touch_app</span><p className="mt-4 text-sm text-on-surface-variant">Selecione um aspecto colorido na grade.</p></div>}
          </GlassCard>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">{Object.entries(ASPECT_VISUALS).map(([nome, visual]) => <span key={nome} className="rounded-full border px-3 py-1 font-label text-xs capitalize" style={{ color: visual.color, borderColor: `${visual.color}44` }}>{visual.symbol} {nome}</span>)}</div>
      </div>
    </Layout>
  )
}
