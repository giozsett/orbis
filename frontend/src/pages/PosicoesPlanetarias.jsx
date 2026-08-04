import { useMemo, useState } from 'react'

import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import GlassCard from '../components/ui/GlassCard'
import useMapaPrincipal from '../hooks/useMapaPrincipal'
import { visualPlaneta } from '../utils/mapVisuals'

export default function PosicoesPlanetarias() {
  const { mapa, erro } = useMapaPrincipal()
  const [busca, setBusca] = useState('')
  const [movimento, setMovimento] = useState('todos')
  const planetas = useMemo(() => (mapa?.dados?.planetas || []).filter((planeta) => {
    const corresponde = `${planeta.nome} ${planeta.signo}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))
    const movimentoValido = movimento === 'todos' || (movimento === 'retrogrados' ? planeta.retrogrado : !planeta.retrogrado)
    return corresponde && movimentoValido
  }), [mapa, busca, movimento])

  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa?.dados) return <CelestialLoading texto="Lendo posições planetárias" />

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12 xl:p-16">
        <TechnicalHeader mapa={mapa} eyebrow="Dados planetários" titulo="Coordenadas do Mapa" icone="blur_on" descricao="Consulte longitude, signo, casa e movimento de cada corpo calculado no seu mapa principal." />

        <div className="mb-6 grid gap-4 animate-fade-in-up md:grid-cols-[1fr_auto]" style={{ animationDelay: '100ms' }}>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 focus-within:border-primary/40">
            <span className="material-symbols-outlined text-outline">search</span>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar planeta ou signo" className="w-full bg-transparent text-sm outline-none placeholder:text-outline" />
          </label>
          <div className="flex gap-2">
            {[['todos', 'Todos'], ['diretos', 'Diretos'], ['retrogrados', 'Retrógrados']].map(([id, label]) => (
              <button key={id} onClick={() => setMovimento(id)} className={`rounded-full border px-4 py-2 font-label text-xs transition-all ${movimento === id ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 text-outline hover:text-secondary'}`}>{label}</button>
            ))}
          </div>
        </div>

        <GlassCard className="overflow-hidden animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-white/10 bg-surface-container-high/70 font-label text-[10px] uppercase tracking-widest text-outline">
                <tr>{['Corpo celeste', 'Signo', 'Casa', 'Posição', 'Longitude', 'Movimento'].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr>
              </thead>
              <tbody>
                {planetas.map((planeta, index) => {
                  const visual = visualPlaneta(planeta.nome)
                  return (
                    <tr key={planeta.nome} className="animate-fade-in-up border-b border-white/5 transition-colors hover:bg-white/[.035]" style={{ animationDelay: `${index * 55}ms` }}>
                      <td className="px-5 py-4"><span className="flex items-center gap-3 font-headline"><span className="material-symbols-outlined" style={{ color: visual.color }}>{visual.icon}</span>{planeta.nome}</span></td>
                      <td className="px-5 py-4 text-on-surface-variant">{planeta.signo}</td>
                      <td className="px-5 py-4 font-label text-secondary">{planeta.casa}</td>
                      <td className="px-5 py-4 font-label text-sm">{planeta.posicao}</td>
                      <td className="px-5 py-4 font-label text-xs text-outline">{Number(planeta.grau).toFixed(4)}°</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 font-label text-[10px] ${planeta.retrogrado ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>{planeta.retrogrado ? 'Retrógrado' : 'Direto'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </Layout>
  )
}
