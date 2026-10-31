import { useMemo, useState } from 'react'

import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import GlassCard from '../components/ui/GlassCard'
import useMapaSelecionado from '../hooks/useMapaSelecionado'
import { visualPlaneta } from '../utils/mapVisuals'

export default function PosicoesPlanetarias() {
  const { mapa, erro } = useMapaSelecionado()
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
      <div className="p-4 xs:p-5 md:p-12 xl:p-16">
        <TechnicalHeader mapa={mapa} eyebrow="Dados planetários" titulo="Coordenadas do Mapa" icone="blur_on" descricao="Consulte longitude, signo, casa e movimento de cada corpo calculado no mapa selecionado." />

        <div className="mb-6 grid gap-4 animate-fade-in-up md:grid-cols-[1fr_auto]" style={{ animationDelay: '100ms' }}>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 focus-within:border-primary/40">
            <span className="material-symbols-outlined text-outline">search</span>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar planeta ou signo" className="w-full bg-transparent text-sm outline-none placeholder:text-outline" />
          </label>
          <div className="grid grid-cols-3 gap-2 md:flex">
            {[['todos', 'Todos'], ['diretos', 'Diretos'], ['retrogrados', 'Retrógrados']].map(([id, label]) => (
              <button key={id} onClick={() => setMovimento(id)} aria-pressed={movimento === id} className={`min-h-[44px] rounded-full border px-3 py-2 font-label text-xs transition-all md:px-4 ${movimento === id ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 text-outline hover:text-secondary'}`}>{label}</button>
            ))}
          </div>
        </div>

        {/* Mobile: um card por corpo celeste no lugar da tabela larga */}
        <ul className="space-y-3 md:hidden">
          {planetas.map((planeta, index) => {
            const visual = visualPlaneta(planeta.nome)
            return (
              <li key={planeta.nome} className="glass-card animate-fade-in-up rounded-2xl p-4" style={{ animationDelay: `${index * 45}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl" style={{ color: visual.color }}>{visual.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-headline text-lg leading-tight">{planeta.nome}</p>
                    <p className="text-sm text-on-surface-variant">{planeta.signo} · <span className="font-label text-secondary">Casa {planeta.casa}</span></p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 font-label text-[10px] ${planeta.retrogrado ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>{planeta.retrogrado ? 'Retrógrado' : 'Direto'}</span>
                </div>
                <div className="mt-3 flex justify-between rounded-xl border border-white/5 bg-white/[.025] px-3 py-2 font-label text-xs">
                  <span><span className="text-outline">Posição </span>{planeta.posicao}</span>
                  <span className="text-outline">{Number(planeta.grau).toFixed(4)}°</span>
                </div>
              </li>
            )
          })}
        </ul>

        <GlassCard className="hidden overflow-hidden animate-fade-in-up md:block" style={{ animationDelay: '180ms' }}>
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
