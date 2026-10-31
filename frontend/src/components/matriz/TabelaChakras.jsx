import GlassCard from '../ui/GlassCard'

const COLUNAS = [
  ['fisico', 'Físico'],
  ['energia', 'Energia'],
  ['emocoes', 'Emoções'],
]

export default function TabelaChakras({ chakras, total, catalogo = {}, onArcano }) {
  const celula = (numero) => (
    <button
      type="button"
      onClick={() => onArcano?.(numero)}
      title={catalogo[numero]?.nome}
      className="min-h-[36px] min-w-[36px] rounded-full px-2 font-label text-sm text-on-surface transition-colors hover:bg-white/10"
    >
      {numero}
    </button>
  )

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 p-4 md:p-5">
        <h2 className="font-headline text-xl">Mapa da saúde</h2>
        <span className="material-symbols-outlined text-primary">self_improvement</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[340px] text-left text-sm">
          <thead>
            <tr className="font-label text-[10px] uppercase tracking-[0.16em] text-outline">
              <th scope="col" className="px-4 py-3 font-normal md:px-5">Chakra</th>
              {COLUNAS.map(([id, rotulo]) => <th key={id} scope="col" className="px-2 py-3 text-center font-normal">{rotulo}</th>)}
            </tr>
          </thead>
          <tbody>
            {chakras.map((chakra) => (
              <tr key={chakra.id} className="border-t border-white/5">
                <th scope="row" className="px-4 py-2 font-normal md:px-5">
                  <span className="flex items-center gap-3">
                    <span className="h-3 w-3 shrink-0 rounded-full shadow-[0_0_10px_currentColor]" style={{ color: chakra.cor, backgroundColor: chakra.cor }} />
                    <span>
                      <span className="block text-on-surface">{chakra.nome}</span>
                      <span className="block font-label text-[10px] uppercase tracking-wider text-outline">{chakra.descricao}</span>
                    </span>
                  </span>
                </th>
                {COLUNAS.map(([id]) => <td key={id} className="px-2 py-2 text-center">{celula(chakra[id])}</td>)}
              </tr>
            ))}
            <tr className="border-t border-primary/20 bg-primary/5">
              <th scope="row" className="px-4 py-3 font-label text-xs uppercase tracking-[0.16em] text-primary md:px-5">Total</th>
              {COLUNAS.map(([id]) => <td key={id} className="px-2 py-2 text-center">{celula(total[id])}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
