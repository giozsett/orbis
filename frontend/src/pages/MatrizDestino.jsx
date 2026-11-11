import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import ArcanoDetalhes from '../components/arcano/ArcanoDetalhes'
import ArcanoIlustracao from '../components/arcano/ArcanoIlustracao'
import Matriz, { rotuloPonto } from '../components/matriz/MatrizDestino'
import LinhaIdades from '../components/matriz/LinhaIdades'
import TabelaChakras from '../components/matriz/TabelaChakras'
import GlassCard from '../components/ui/GlassCard'
import useTarotMapa from '../hooks/useTarotMapa'

// [chave, rótulo, descrição] dos propósitos, agrupados como no método do octagrama
const PROPOSITOS = [
  ['Propósito pessoal', 'até os 40 anos', [['ceu', 'Céu'], ['terra', 'Terra'], ['pessoal', 'Resultado']]],
  ['Propósito social', 'dos 40 aos 60 anos', [['masculina', 'Linha masculina'], ['feminina', 'Linha feminina'], ['social', 'Resultado']]],
  ['Propósito espiritual', 'a partir dos 60 anos', [['espiritual', 'Pessoal + social']]],
]

// Linha de leitura: rótulo à esquerda, numeral e nome do arcano à direita.
// Ocupa a largura toda do card, então nunca disputa espaço com as vizinhas.
function Leitura({ rotulo, numero, catalogo, onArcano, destaque = false, cor }) {
  return (
    <button
      type="button"
      onClick={() => onArcano(numero)}
      className="group flex min-h-[48px] w-full items-center gap-3 border-t border-white/[0.06] py-2 text-left first:border-t-0"
    >
      <span className="min-w-0 flex-1 truncate text-sm text-on-surface-variant" style={cor ? { color: cor } : undefined}>{rotulo}</span>
      <span className={`min-w-0 truncate text-right text-sm transition-colors group-hover:text-on-surface ${destaque ? 'text-on-surface' : 'text-outline'}`}>{catalogo[numero]?.nome}</span>
      <span className={`w-9 shrink-0 text-right font-headline text-2xl leading-none ${destaque ? 'text-primary' : 'text-on-surface'}`}>{numero}</span>
    </button>
  )
}

export default function MatrizDestino() {
  const { mapa, tarot, erro } = useTarotMapa()
  const [selecionado, setSelecionado] = useState('E')
  const [hover, setHover] = useState(null)
  const [aberto, setAberto] = useState(null)

  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa || !tarot) return <CelestialLoading texto="Traçando sua matriz do destino" />

  const { matriz, catalogo } = tarot
  const abrir = (numero) => setAberto(catalogo[numero])
  const pontoPainel = hover || selecionado
  const arcanoPainel = catalogo[matriz.pontos[pontoPainel]]
  const { canais, proposito } = matriz

  return (
    <Layout>
      <div className="p-4 xs:p-5 md:p-12 xl:p-16">
        <TechnicalHeader
          mapa={mapa}
          eyebrow="Tarot"
          titulo="Matriz do Destino"
          icone="pentagon"
          descricao="O octagrama dos Arcanos Maiores calculado a partir da data de nascimento: o quadrado pessoal (dia, mês, ano e carma), o quadrado ancestral, os canais de amor e dinheiro e a linha do tempo de 0 a 80 anos."
        />

        <section className="grid grid-cols-1 items-start gap-6 md:gap-8 xl:grid-cols-12">
          <div className="relative flex flex-col items-center gap-4 xl:col-span-7">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-container/10 blur-[90px] motion-safe:animate-orbis-twinkle" />
            <div className="relative aspect-square w-full max-w-[640px]">
              <Matriz
                key={mapa.id}
                matriz={matriz}
                catalogo={catalogo}
                selecionado={selecionado}
                onPontoHover={setHover}
                onPontoClick={setSelecionado}
              />
            </div>
            <p className="relative rounded-full border border-white/[0.08] bg-surface-container-low/50 px-3.5 py-1.5 text-center font-label text-[10px] uppercase tracking-[0.18em] text-outline backdrop-blur-sm">
              <span className="[@media(hover:none)]:hidden">passe o cursor ou clique em um ponto</span>
              <span className="hidden [@media(hover:none)]:inline">toque em um ponto</span>
            </p>
          </div>

          <div className="space-y-4 xl:col-span-5">
            {arcanoPainel && (
              <GlassCard key={pontoPainel} className="flex gap-4 p-5 motion-safe:animate-orbis-swap md:p-6" style={{ '--arcano-cor': arcanoPainel.cores?.[0] }}>
                <div className="h-32 w-20 shrink-0"><ArcanoIlustracao arcano={arcanoPainel} compacta /></div>
                <div className="min-w-0">
                  <p className="font-label text-[11px] uppercase tracking-[0.22em]" style={{ color: arcanoPainel.cores?.[0] }}>{rotuloPonto(pontoPainel)}</p>
                  <h2 className="mt-1 font-headline text-2xl leading-tight">{arcanoPainel.numero} · {arcanoPainel.nome}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{arcanoPainel.resumo}</p>
                  <button type="button" onClick={() => setAberto(arcanoPainel)} className="mt-3 min-h-[44px] rounded-full border px-4 text-sm transition-colors hover:bg-white/5" style={{ borderColor: `${arcanoPainel.cores?.[0]}80`, color: arcanoPainel.cores?.[0] }}>
                    Ler o arcano
                  </button>
                </div>
              </GlassCard>
            )}

            {PROPOSITOS.map(([titulo, fase, itens]) => (
              <GlassCard key={titulo} className="p-5">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="font-headline text-xl">{titulo}</h3>
                  <p className="text-xs text-outline">{fase}</p>
                </div>
                {itens.map(([chave, rotulo]) => (
                  <Leitura key={chave} rotulo={rotulo} numero={proposito[chave]} catalogo={catalogo} onArcano={abrir} destaque={chave === 'pessoal' || chave === 'social' || chave === 'espiritual'} />
                ))}
              </GlassCard>
            ))}

            <GlassCard className="p-5">
              <h3 className="mb-1 font-headline text-xl">Amor, dinheiro e carma</h3>
              <Leitura rotulo="Canal do dinheiro" cor="#f2c7a5" numero={canais.dinheiro.canal} catalogo={catalogo} onArcano={abrir} destaque />
              <Leitura rotulo="Canal do amor" cor="#ff897d" numero={canais.amor.canal} catalogo={catalogo} onArcano={abrir} destaque />
              <div className="flex min-h-[48px] items-center gap-3 border-t border-white/[0.06] py-2">
                <span className="min-w-0 flex-1 truncate text-sm text-[#ff6a7d]">Cauda cármica</span>
                <span className="flex shrink-0 items-center font-headline text-2xl leading-none text-on-surface">
                  {canais.cauda_carmica.map((numero, i) => (
                    <span key={i} className="flex items-center">
                      {i > 0 && <span className="px-1 text-base text-outline" aria-hidden="true">–</span>}
                      <button type="button" onClick={() => abrir(numero)} title={catalogo[numero]?.nome} className="min-h-[40px] rounded-full px-1.5 transition-colors hover:text-primary">{numero}</button>
                    </span>
                  ))}
                </span>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:mt-8 md:gap-8 xl:grid-cols-2">
          <LinhaIdades idades={matriz.idades} catalogo={catalogo} onArcano={abrir} />
          <TabelaChakras chakras={matriz.chakras} total={matriz.chakras_total} catalogo={catalogo} onArcano={abrir} />
        </section>

        <p className="mt-8 text-center text-xs text-outline">Leitura simbólica do tarot, complementar e independente do cálculo astrológico.</p>
      </div>
      <ArcanoDetalhes arcano={aberto} aberto={Boolean(aberto)} onFechar={() => setAberto(null)} />
    </Layout>
  )
}
