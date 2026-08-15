import { useState } from 'react'
import { Link } from 'react-router-dom'
import GlassPanel from '../ui/GlassPanel'
import ArcanoCard from '../arcano/ArcanoCard'

function formatarData(data) {
  if (!data) return 'Data não informada'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T00:00:00`))
}

export default function MapSummaryCard({
  mapa,
  destaque = false,
  onDelete,
  excluindo = false,
  removendo = false,
}) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const titulo = mapa.nome?.trim() || (mapa.principal ? 'Meu mapa natal' : `Mapa de ${formatarData(mapa.data_nascimento)}`)
  const resumo = mapa.resumo || {}

  return (
    <GlassPanel
      className={`p-6 flex h-full flex-col border transition-all duration-500 ${
        removendo
          ? 'pointer-events-none -translate-y-3 scale-95 border-error/20 opacity-0 blur-sm'
          : 'hover:-translate-y-1 hover:border-primary/30'
      } ${
        destaque ? 'border-primary/30 shadow-[0_0_30px_rgba(255,177,195,0.08)]' : 'border-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
            mapa.principal
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-tertiary/20 bg-tertiary/10 text-tertiary'
          }`}>
            <span className="material-symbols-outlined text-3xl">blur_circular</span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-headline text-xl text-on-surface">{titulo}</h2>
            <p className="mt-1 truncate text-sm text-on-surface-variant">{mapa.local_nascimento}</p>
          </div>
        </div>

        <span className={`shrink-0 rounded-full border px-3 py-1 font-label text-[10px] uppercase tracking-wider ${
          mapa.principal
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-white/10 bg-white/5 text-outline'
        }`}>
          {mapa.principal ? 'Principal' : 'Adicional'}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/5 bg-surface-container-low/70 p-3">
          <dt className="font-label text-[10px] uppercase tracking-widest text-outline">Nascimento</dt>
          <dd className="mt-2 text-sm text-on-surface">{formatarData(mapa.data_nascimento)}</dd>
          <dd className="mt-1 font-label text-xs text-secondary">{mapa.horario_nascimento}</dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-surface-container-low/70 p-3">
          <dt className="font-label text-[10px] uppercase tracking-widest text-outline">Assinatura</dt>
          <dd className="mt-2 text-sm text-on-surface">Sol em {resumo.sol_signo || '—'}</dd>
          <dd className="mt-1 font-label text-xs text-tertiary">Asc. {resumo.ascendente_signo || '—'}</dd>
        </div>
      </dl>

      <ArcanoCard arcano={mapa.arcano_pessoal} compacta />

      {mapa.principal && (
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
          Horóscopos e conversas do Chat Astral usam este mapa.
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <span className="font-label text-[10px] uppercase tracking-widest text-outline">Mapa #{mapa.id}</span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!mapa.principal && onDelete && (
            confirmandoExclusao ? (
              <div className="flex items-center gap-2 rounded-full border border-error/20 bg-error/5 p-1 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  disabled={excluindo}
                  className="rounded-full px-3 py-2 font-label text-[10px] uppercase tracking-wider text-outline transition-colors hover:bg-white/5 hover:text-on-surface disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(mapa.id)}
                  disabled={excluindo}
                  className="flex items-center gap-2 rounded-full bg-error/15 px-3 py-2 font-label text-[10px] uppercase tracking-wider text-error transition-all hover:bg-error/25 disabled:cursor-wait disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-base ${excluindo ? 'animate-spin' : ''}`}>
                    {excluindo ? 'progress_activity' : 'delete_forever'}
                  </span>
                  {excluindo ? 'Excluindo…' : 'Confirmar'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                aria-label={`Excluir ${titulo}`}
                title="Excluir mapa"
                className="group/delete flex h-9 w-9 items-center justify-center rounded-full border border-error/20 text-error/70 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:border-error/40 hover:bg-error/10 hover:text-error hover:shadow-[0_0_18px_rgba(255,180,171,0.12)]"
              >
                <span className="material-symbols-outlined text-lg transition-transform group-hover/delete:-translate-y-0.5">delete</span>
              </button>
            )
          )}

          <Link
            to={`/mapa/${mapa.id}`}
            className="flex items-center gap-2 rounded-full border border-secondary/30 px-4 py-2 font-label text-xs text-secondary transition-colors hover:bg-secondary/10"
          >
            Abrir mapa
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
    </GlassPanel>
  )
}
