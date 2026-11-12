import { useMemo, useState } from 'react'

import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import BottomSheet from '../components/ui/BottomSheet'
import GlassCard from '../components/ui/GlassCard'
import Glifo from '../components/ui/Glifo'
import useMapaSelecionado from '../hooks/useMapaSelecionado'
import { ASPECT_VISUALS } from '../utils/mapVisuals'

const chave = (a, b) => [a, b].sort().join('|')

export default function Aspectos() {
  const { mapa, erro } = useMapaSelecionado()
  const [selecionado, setSelecionado] = useState(null)
  const [vista, setVista] = useState('lista')
  const [detalheMobile, setDetalheMobile] = useState(false)
  const grade = useMemo(() => new Map((mapa?.dados?.aspectos || []).map((aspecto) => [chave(aspecto.planeta1.nome, aspecto.planeta2.nome), aspecto])), [mapa])

  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa?.dados) return <CelestialLoading texto="Traçando grade de aspectos" />
  const planetas = mapa.dados.planetas.map((item) => item.nome)
  const aspectos = mapa.dados.aspectos || []
  const escolher = (aspecto) => {
    setSelecionado(aspecto)
    if (window.matchMedia('(max-width: 1279px)').matches) setDetalheMobile(true)
  }

  const detalhe = selecionado && (() => {
    const visual = ASPECT_VISUALS[selecionado.tipo] || { symbol: '·', color: '#a9b8ff' }
    return <div><Glifo simbolo={visual.symbol} className="text-6xl" style={{ color: visual.color }} /><p className="mt-5 font-label text-xs uppercase tracking-widest text-outline">Aspecto selecionado</p><h2 className="mt-2 font-headline text-2xl capitalize">{selecionado.tipo}</h2><p className="mt-4 text-on-surface-variant">{selecionado.planeta1.nome} e {selecionado.planeta2.nome}</p><div className="mt-5 rounded-xl border border-veu/10 bg-veu/[.03] p-4"><span className="font-label text-xs text-outline">Orbe</span><p className="font-headline text-2xl" style={{ color: visual.color }}>{Number(selecionado.orbe).toFixed(2)}°</p></div></div>
  })()

  return (
    <Layout>
      <div className="p-4 xs:p-5 md:p-12 xl:p-16">
        <TechnicalHeader mapa={mapa} eyebrow="Aspect grid" titulo="Geometria Planetária" icone="grid_4x4" descricao="A matriz mostra as relações angulares encontradas entre os corpos do seu mapa natal. Selecione um símbolo para inspecionar o orbe." />
        <div className="mb-4 grid grid-cols-2 rounded-full border border-veu/10 bg-surface-container-low/70 p-1 md:hidden" role="tablist" aria-label="Forma de exibição">
          {[['lista', 'Lista', 'list'], ['grade', 'Grade', 'grid_4x4']].map(([id, label, icone]) => (
            <button key={id} type="button" role="tab" aria-selected={vista === id} onClick={() => setVista(id)} className={`flex h-10 items-center justify-center gap-2 rounded-full font-label text-xs uppercase tracking-wider transition-colors ${vista === id ? 'bg-primary/15 text-primary' : 'text-outline'}`}>
              <span className="material-symbols-outlined text-base">{icone}</span>{label}
            </button>
          ))}
        </div>

        {vista === 'lista' && (
          <ul className="space-y-2 md:hidden">
            {aspectos.map((aspecto, index) => {
              const visual = ASPECT_VISUALS[aspecto.tipo] || { symbol: '·', color: '#a9b8ff' }
              return (
                <li key={`${aspecto.planeta1.nome}-${aspecto.planeta2.nome}`} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}>
                  <button type="button" onClick={() => escolher(aspecto)} className="glass-card flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left active:bg-veu/10">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl" style={{ color: visual.color, borderColor: `${visual.color}55` }}><Glifo simbolo={visual.symbol} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-on-surface">{aspecto.planeta1.nome} <span className="text-outline">·</span> {aspecto.planeta2.nome}</span>
                      <span className="font-label text-[11px] capitalize" style={{ color: visual.color }}>{aspecto.tipo}</span>
                    </span>
                    <span className="shrink-0 font-dados text-xs text-outline">{Number(aspecto.orbe).toFixed(1)}°</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className={`grid gap-6 xl:grid-cols-[1fr_310px] ${vista === 'lista' ? 'max-md:hidden' : ''}`}>
          <GlassCard className="overflow-hidden animate-fade-in-up">
            <div className="custom-scrollbar overflow-auto p-2 md:p-3">
              <table className="mx-auto border-separate border-spacing-1">
                <thead><tr><th /><th colSpan={planetas.length} className="pb-3 font-label text-[10px] uppercase tracking-widest text-outline">Planeta relacionado</th></tr></thead>
                <tbody>
                  {planetas.map((linha, i) => (
                    <tr key={linha} className="animate-fade-in" style={{ animationDelay: `${i * 65}ms` }}>
                      <th className="sticky left-0 z-10 whitespace-nowrap bg-surface-container/95 pr-2 text-right font-label text-[10px] text-on-surface-variant md:static md:bg-transparent md:pr-3">{linha}</th>
                      {planetas.map((coluna, j) => {
                        const aspecto = grade.get(chave(linha, coluna))
                        const visual = aspecto && ASPECT_VISUALS[aspecto.tipo]
                        return (
                          <td key={coluna}>
                            <button disabled={!aspecto || i === j} onClick={() => escolher(aspecto)} title={aspecto ? `${aspecto.tipo} · orbe ${aspecto.orbe}°` : ''} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-base md:h-10 md:w-10 md:text-lg transition-all ${i === j ? 'border-primary/15 bg-primary/10' : aspecto ? 'hover:scale-110 hover:bg-veu/10' : 'border-veu/[.035] text-veu/10'}`} style={aspecto ? { borderColor: `${visual.color}55`, color: visual.color } : undefined}>{i === j ? '·' : visual ? <Glifo simbolo={visual.symbol} /> : ''}</button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard magnetic className="relative hidden min-h-64 overflow-hidden p-6 animate-slide-in-right xl:block">
            {detalhe || <div className="flex h-full min-h-52 flex-col items-center justify-center text-center"><span className="material-symbols-outlined animate-pulse-soft text-6xl text-primary/40">touch_app</span><p className="mt-4 text-sm text-on-surface-variant">Selecione um aspecto colorido na grade.</p></div>}
          </GlassCard>
        </div>
        <BottomSheet aberto={detalheMobile && !!selecionado} onFechar={() => setDetalheMobile(false)} titulo="Aspecto">{detalhe}</BottomSheet>
        <div className="mt-6 flex flex-wrap gap-2 md:gap-3">{Object.entries(ASPECT_VISUALS).map(([nome, visual]) => <span key={nome} className="rounded-full border px-3 py-1 font-label text-xs capitalize" style={{ color: visual.color, borderColor: `${visual.color}44` }}><Glifo simbolo={visual.symbol} className="mr-1" />{nome}</span>)}</div>
      </div>
    </Layout>
  )
}
