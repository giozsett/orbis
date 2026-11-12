import ArcanoIlustracao from './ArcanoIlustracao'
import './arcano.css'
import { corTema } from '../../utils/tema'

export default function ArcanoCard({ arcano, compacta = false, rotulo = 'Arcano pessoal', nota, acao = 'Explorar meu arcano', onExplorar }) {
  if (!arcano) return null
  const cor = corTema(arcano.cores?.[0] || '#a9b8ff')
  if (compacta) {
    return (
      <div className="arcano-mini" style={{ '--arcano-cor': cor }}>
        <div className="h-20 w-12 shrink-0"><ArcanoIlustracao arcano={arcano} compacta /></div>
        <div className="min-w-0">
          <p className="font-label text-[9px] uppercase tracking-widest text-outline">{rotulo}</p>
          <p className="truncate text-sm text-on-surface">{arcano.numero} · {arcano.nome}</p>
        </div>
      </div>
    )
  }
  return (
    <section className="arcano-destaque" style={{ '--arcano-cor': cor }} aria-label={`${rotulo}: ${arcano.nome}`}>
      <div className="arcano-carta h-[260px] w-[158px] shrink-0 md:h-[330px] md:w-[200px]"><ArcanoIlustracao arcano={arcano} /></div>
      <div className="max-w-xl">
        <p className="font-label text-xs uppercase tracking-[.25em]" style={{ color: cor }}>{rotulo}</p>
        <h2 className="mt-2 font-headline text-2xl text-on-surface md:text-3xl">{arcano.numero} · {arcano.nome}</h2>
        <p className="mt-4 leading-relaxed text-on-surface-variant">{arcano.resumo}</p>
        <div className="mt-4 flex flex-wrap gap-2">{arcano.palavras_chave.map(palavra => <span key={palavra} className="arcano-tag">{palavra}</span>)}</div>
        <p className="mt-5 text-xs leading-relaxed text-outline">{nota || 'Leitura simbólica do tarot, complementar e independente do cálculo astrológico.'}</p>
        {onExplorar && <button type="button" onClick={onExplorar} className="mt-6 min-h-[44px] w-full rounded-full border px-5 py-2 text-sm md:w-auto transition-colors hover:bg-veu/5" style={{ borderColor: `${cor}80`, color: cor }}>{acao}</button>}
      </div>
    </section>
  )
}
