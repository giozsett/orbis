import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import ArcanoCard from '../components/arcano/ArcanoCard'
import ArcanoDetalhes from '../components/arcano/ArcanoDetalhes'
import GlassCard from '../components/ui/GlassCard'
import useTarotMapa from '../hooks/useTarotMapa'

function dataBR(iso) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export default function Arcanos() {
  // null = ciclo atual, definido pelo servidor a partir do último aniversário
  const [ano, setAno] = useState(null)
  const [aberto, setAberto] = useState(null)
  const { mapa, tarot, erro } = useTarotMapa(ano)

  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa || !tarot) return <CelestialLoading texto="Embaralhando os arcanos" />

  const { pessoal, complementar, anual } = tarot.arcanos
  const nascimento = dataBR(tarot.mapa.data_nascimento)
  const [dia, mes] = nascimento.split('/')

  return (
    <Layout>
      <div className="p-4 xs:p-5 md:p-12 xl:p-16">
        <TechnicalHeader
          mapa={mapa}
          eyebrow="Tarot"
          titulo="Seus Arcanos"
          icone="style"
          descricao={`Os Arcanos Maiores que acompanham a data de nascimento ${nascimento}: o pessoal, que acompanha a vida toda, o complementar, que o equilibra, e o anual, que colore cada ciclo de aniversário.`}
        />

        <div className="space-y-6 md:space-y-8">
          <div className="motion-safe:animate-orbis-rise" style={{ animationDelay: '500ms' }}>
            <ArcanoCard
              arcano={pessoal}
              rotulo="Arcano pessoal"
              nota={`Soma de todos os algarismos da data de nascimento (${nascimento}), reduzida até 22.`}
              onExplorar={() => setAberto(pessoal)}
            />
          </div>

          <div className="motion-safe:animate-orbis-rise" style={{ animationDelay: '650ms' }}>
            {complementar ? (
              <ArcanoCard
                arcano={complementar}
                rotulo="Arcano complementar"
                nota={`Soma dos dígitos do arcano pessoal (${pessoal.numero}).`}
                acao="Explorar o complementar"
                onExplorar={() => setAberto(complementar)}
              />
            ) : (
              <GlassCard className="p-5 md:p-6">
                <p className="font-label text-xs uppercase tracking-[.25em] text-primary">Arcano complementar</p>
                <p className="mt-3 leading-relaxed text-on-surface-variant">
                  Seu arcano pessoal tem um só dígito ({pessoal.numero}), então ele não se desdobra em um complementar: a energia de {pessoal.nome} aparece inteira, sem contraponto.
                </p>
              </GlassCard>
            )}
          </div>

          <div className="space-y-3 motion-safe:animate-orbis-rise" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <button type="button" onClick={() => setAno(anual.ano - 1)} aria-label="Ano anterior" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-on-surface-variant transition-colors hover:bg-white/5">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <p className="min-w-[7rem] text-center font-label text-sm uppercase tracking-[0.2em] text-on-surface" aria-live="polite">Ciclo {anual.ano}</p>
              <button type="button" onClick={() => setAno(anual.ano + 1)} aria-label="Próximo ano" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-on-surface-variant transition-colors hover:bg-white/5">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              {ano !== null && (
                <button type="button" onClick={() => setAno(null)} className="ml-1 min-h-[44px] rounded-full px-3 font-label text-xs uppercase tracking-wider text-primary hover:bg-white/5">Hoje</button>
              )}
            </div>
            <ArcanoCard
              arcano={anual}
              rotulo={`Arcano anual · ${anual.ano}`}
              nota={`Algarismos do dia e mês de nascimento (${dia}/${mes}) somados aos de ${anual.ano}, reduzidos até 22. Vale do aniversário de ${anual.ano} ao seguinte.`}
              acao="Explorar o ano"
              onExplorar={() => setAberto(anual)}
            />
          </div>

          <Link to="/matriz-do-destino" className="flex items-center justify-center gap-2 rounded-full border border-primary/30 px-5 py-3 font-label text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10 md:inline-flex">
            Ver a matriz do destino
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
      <ArcanoDetalhes arcano={aberto} aberto={Boolean(aberto)} onFechar={() => setAberto(null)} />
    </Layout>
  )
}
