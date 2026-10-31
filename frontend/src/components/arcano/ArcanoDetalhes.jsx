import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import ArcanoIlustracao from './ArcanoIlustracao'

export default function ArcanoDetalhes({ arcano, aberto, onFechar }) {
  useEffect(() => {
    if (!aberto) return undefined
    const fechar = evento => evento.key === 'Escape' && onFechar()
    window.addEventListener('keydown', fechar)
    return () => window.removeEventListener('keydown', fechar)
  }, [aberto, onFechar])
  if (!aberto || !arcano) return null
  // portal: o modal precisa ficar acima da barra superior e da tab bar do mobile
  return createPortal(
    <div className="arcano-modal" role="dialog" aria-modal="true" aria-labelledby="arcano-modal-titulo" onMouseDown={evento => evento.target === evento.currentTarget && onFechar()}>
      <div className="arcano-modal-conteudo">
        <button type="button" className="arcano-fechar" onClick={onFechar} aria-label="Fechar detalhes do arcano">×</button>
        <div className="mx-auto h-[300px] w-[182px] shrink-0 md:h-[420px] md:w-[255px]"><ArcanoIlustracao arcano={arcano} /></div>
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-primary">Leitura simbólica</p>
          <h2 id="arcano-modal-titulo" className="mt-2 font-headline text-2xl md:text-3xl">{arcano.nome}</h2>
          <p className="mt-4 leading-relaxed text-on-surface-variant">{arcano.resumo}</p>
          <h3 className="mt-6 font-headline text-xl">Potenciais</h3>
          <ul className="mt-2 list-inside list-disc text-on-surface-variant">{arcano.potenciais.map(item => <li key={item}>{item}</li>)}</ul>
          <h3 className="mt-5 font-headline text-xl">Desafios</h3>
          <ul className="mt-2 list-inside list-disc text-on-surface-variant">{arcano.desafios.map(item => <li key={item}>{item}</li>)}</ul>
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4"><strong>Conselho:</strong> {arcano.conselho}</div>
          <blockquote className="mt-5 border-l-2 border-secondary pl-4 italic text-secondary">{arcano.pergunta_reflexao}</blockquote>
        </div>
      </div>
    </div>,
    document.body,
  )
}
