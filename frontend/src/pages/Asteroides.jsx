import { useEffect, useState } from 'react'

import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import GlassCard from '../components/ui/GlassCard'

const VISUAIS = {
  'Quíron': { icon: 'healing', color: '#ffb1c3' }, Ceres: { icon: 'eco', color: '#8fd9d1' }, Palas: { icon: 'strategy', color: '#deb7ff' }, Juno: { icon: 'handshake', color: '#eab9ce' }, Vesta: { icon: 'local_fire_department', color: '#ffb4ab' },
}

export default function Asteroides() {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  useEffect(() => { fetch('/mapas/principal/asteroides', { credentials: 'include', headers: { Accept: 'application/json' } }).then(async (response) => { if (response.status === 401) { window.location.assign('/login'); return null } const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.erro || 'Não foi possível calcular os asteroides.'); return payload }).then((payload) => payload && setDados(payload)).catch((error) => setErro(error.message)) }, [])
  if (erro) return <CelestialError mensagem={erro} />
  if (!dados) return <CelestialLoading texto="Consultando efemérides de asteroides" />

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12 xl:p-16">
        <TechnicalHeader mapa={dados.mapa} eyebrow="Asteroids" titulo="Corpos Menores" icone="star" descricao="Quíron, Ceres, Palas, Juno e Vesta calculados para o mesmo instante e as mesmas cúspides do seu mapa principal." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">{dados.asteroides.map((item, index) => { const visual = VISUAIS[item.nome] || { icon: 'star', color: '#ffb1c3' }; return <GlassCard key={item.nome} magnetic className="group relative min-h-80 overflow-hidden p-6 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}><div className="absolute -right-14 -top-14 h-40 w-40 animate-rotate-slow rounded-full border border-dashed opacity-20" style={{ borderColor: visual.color }} /><span className="material-symbols-outlined text-5xl transition-transform group-hover:scale-110" style={{ color: visual.color }}>{visual.icon}</span><h2 className="mt-6 font-headline text-2xl">{item.nome}</h2><p className="mt-2 font-label text-xs" style={{ color: visual.color }}>{item.signo} · Casa {item.casa}</p><p className="mt-1 font-label text-[10px] text-outline">{item.posicao} · {item.retrogrado ? 'Retrógrado' : 'Direto'}</p><div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" /><p className="mt-5 text-sm leading-relaxed text-on-surface-variant">{item.interpretacao}</p></GlassCard> })}</div>
        <p className="mt-8 animate-fade-in text-center text-xs text-outline">Efemérides Swiss Ephemeris · cobertura do arquivo atual: 1800–2399</p>
      </div>
    </Layout>
  )
}
