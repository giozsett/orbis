import { useEffect, useState } from 'react'

import Layout from '../components/layout/Layout'
import GlassCard from '../components/ui/GlassCard'

const PLANETAS_VISUAIS = {
  Sol: { icon: 'wb_sunny', color: '#ffb1c3' },
  Lua: { icon: 'dark_mode', color: '#deb7ff' },
  Mercúrio: { icon: 'auto_awesome_motion', color: '#eab9ce' },
  Vênus: { icon: 'favorite', color: '#ff4b89' },
  Marte: { icon: 'local_fire_department', color: '#ffb4ab' },
  Júpiter: { icon: 'expand_circle_up', color: '#b86dfd' },
  Saturno: { icon: 'schedule', color: '#ac878f' },
  Urano: { icon: 'public', color: '#91cfff' },
  Netuno: { icon: 'water_drop', color: '#8fd9d1' },
  Plutão: { icon: 'diamond', color: '#d9b8ff' },
  'Nodo Norte': { icon: 'route', color: '#f4c2d7' },
}

function textoInterpretacao(planeta) {
  const interpretacao = planeta.interpretacao_base || {}
  return [interpretacao.planeta, interpretacao.signo, interpretacao.casa]
    .filter(Boolean)
    .join(' ')
}

export default function Interpretacoes() {
  const [mapa, setMapa] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/mapas/principal', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload.mapa) {
          throw new Error(payload.erro || 'Não foi possível carregar as interpretações do mapa principal.')
        }
        setMapa(payload.mapa)
      })
      .catch((error) => setErro(error.message))
  }, [])

  if (erro) {
    return <Layout><div className="p-16 text-error">{erro}</div></Layout>
  }

  if (!mapa?.dados) {
    return <Layout><div className="p-16 text-on-surface-variant">Carregando interpretações do mapa natal…</div></Layout>
  }

  return (
    <Layout>
      <div className="p-6 md:p-16 min-h-screen">
        <header className="mb-12 max-w-4xl animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-12 bg-primary" />
            <span className="font-label text-xs text-primary uppercase tracking-[0.2em]">Mapa principal · {mapa.nome}</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4">Posições Planetárias</h1>
          <p className="text-lg text-on-surface-variant/80 max-w-2xl">
            Interpretações das posições calculadas para {mapa.local_nascimento}, usando o mesmo mapa natal exibido na mandala principal.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mapa.dados.planetas.map((planeta, index) => {
            const visual = PLANETAS_VISUAIS[planeta.nome] || { icon: 'blur_on', color: '#ffb1c3' }
            return (
              <GlassCard
                key={planeta.nome}
                magnetic
                className="p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined" style={{ fontSize: '80px', color: visual.color, fontVariationSettings: "'FILL' 1" }}>
                    {visual.icon}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg border" style={{ backgroundColor: `${visual.color}15`, borderColor: `${visual.color}30` }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: visual.color, fontVariationSettings: "'FILL' 1" }}>
                      {visual.icon}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-label text-xs text-outline uppercase">Posição</div>
                    <div className="font-label text-sm text-secondary">{planeta.signo}, Casa {planeta.casa}</div>
                  </div>
                </div>

                <div>
                  <h2 className="font-headline text-2xl mb-2">{planeta.nome}</h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{textoInterpretacao(planeta)}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex gap-8">
                  <div className="flex flex-col">
                    <span className="font-label text-xs text-outline">Coordenada</span>
                    <span className="font-label text-sm" style={{ color: visual.color }}>{planeta.posicao}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label text-xs text-outline">Movimento</span>
                    <span className="font-label text-sm" style={{ color: visual.color }}>{planeta.retrogrado ? 'Retrógrado' : 'Direto'}</span>
                  </div>
                </div>
              </GlassCard>
            )
          })}

          <div className="col-span-1 md:col-span-2 xl:col-span-3 h-64 glass-panel rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="relative z-10 text-center">
              <p className="font-label text-xs text-primary uppercase tracking-[0.4em] mb-2">Sistema de casas</p>
              <p className="font-headline text-2xl text-on-surface">{mapa.dados.sistema_casas}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
