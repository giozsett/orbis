import ArcanoIlustracao from './ArcanoIlustracao'
import './arcano.css'

export default function ArcanoCard({ arcano, compacta = false, onExplorar }) {
  if (!arcano) return null
  const cor = arcano.cores?.[0] || '#ffb1c3'
  if (compacta) {
    return (
      <div className="arcano-mini" style={{ '--arcano-cor': cor }}>
        <div className="h-20 w-12 shrink-0"><ArcanoIlustracao arcano={arcano} compacta /></div>
        <div className="min-w-0">
          <p className="font-label text-[9px] uppercase tracking-widest text-outline">Arcano pessoal</p>
          <p className="truncate text-sm text-on-surface">{arcano.numero} · {arcano.nome}</p>
        </div>
      </div>
    )
  }
  return (
    <section className="arcano-destaque" style={{ '--arcano-cor': cor }} aria-labelledby="arcano-titulo">
      <div className="arcano-carta h-[330px] w-[200px] shrink-0"><ArcanoIlustracao arcano={arcano} /></div>
      <div className="max-w-xl">
        <p className="font-label text-xs uppercase tracking-[.25em]" style={{ color: cor }}>Seu Arcano Pessoal</p>
        <h2 id="arcano-titulo" className="mt-2 font-headline text-3xl text-on-surface">{arcano.numero} · {arcano.nome}</h2>
        <p className="mt-4 leading-relaxed text-on-surface-variant">{arcano.resumo}</p>
        <div className="mt-4 flex flex-wrap gap-2">{arcano.palavras_chave.map(palavra => <span key={palavra} className="arcano-tag">{palavra}</span>)}</div>
        <p className="mt-5 text-xs leading-relaxed text-outline">Leitura simbólica do tarot, complementar e independente do cálculo astrológico.</p>
        <button type="button" onClick={onExplorar} className="mt-6 rounded-full border px-5 py-2 text-sm transition-colors hover:bg-white/5" style={{ borderColor: `${cor}80`, color: cor }}>Explorar meu arcano</button>
      </div>
    </section>
  )
}
