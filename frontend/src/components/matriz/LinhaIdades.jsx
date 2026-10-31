import GlassCard from '../ui/GlassCard'

const formatarIdade = (idade) => (Number.isInteger(idade) ? String(idade) : idade.toFixed(2).replace(/0$/, '').replace('.', ','))

// Agrupa a linha do tempo em décadas: o vértice abre cada período
function agruparPorDecada(idades) {
  const grupos = []
  for (const item of idades) {
    if (item.vertice) grupos.push({ inicio: item.idade, itens: [] })
    grupos.at(-1)?.itens.push(item)
  }
  return grupos
}

export default function LinhaIdades({ idades, catalogo = {}, onArcano }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 p-4 md:p-5">
        <div>
          <h2 className="font-headline text-xl">Linha do tempo</h2>
          <p className="mt-1 text-xs text-outline">Arcanos que marcam cada fase, de 0 a 80 anos.</p>
        </div>
        <span className="material-symbols-outlined text-primary">timeline</span>
      </div>
      <ol className="divide-y divide-white/5">
        {agruparPorDecada(idades).map((grupo) => (
          <li key={grupo.inicio} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:gap-4 md:px-5">
            <p className="w-24 shrink-0 font-label text-xs uppercase tracking-[0.16em] text-primary">{grupo.inicio}–{grupo.inicio + 10} anos</p>
            <ul className="flex flex-wrap gap-1.5">
              {grupo.itens.map((item) => (
                <li key={item.idade}>
                  <button
                    type="button"
                    onClick={() => onArcano?.(item.arcano)}
                    title={`${formatarIdade(item.idade)} anos · ${catalogo[item.arcano]?.nome || ''}`}
                    className={`flex min-h-[36px] flex-col items-center justify-center rounded-xl border px-2.5 py-1 transition-colors hover:bg-white/10 ${item.vertice ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-white/[.03]'}`}
                  >
                    <span className="font-label text-sm text-on-surface">{item.arcano}</span>
                    <span className="font-label text-[9px] text-outline">{formatarIdade(item.idade)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </GlassCard>
  )
}
