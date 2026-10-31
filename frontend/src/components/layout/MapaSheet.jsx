import { Link, useLocation } from 'react-router-dom'
import BottomSheet from '../ui/BottomSheet'
import useSidebarMapa from '../../hooks/useSidebarMapa'
import { corDoMapa } from '../../hooks/useMapaSelecionado'
import { detalhesMapa } from './navItems'

// Versão mobile da Sidebar: chip com o mapa em observação + folha com seletor, páginas técnicas e PDF.
export default function MapaSheet({ aberto, onAbrir, onFechar, mostrarChip }) {
  const location = useLocation()
  const { mapas, selecionado, cor, escolherMapa, exportarPdf, exportando, erroExportacao } = useSidebarMapa()

  return (
    <>
      {mostrarChip && selecionado && (
        <div className="flex justify-center px-4 pt-4 lg:hidden">
          <button
            type="button"
            onClick={onAbrir}
            className="flex h-11 max-w-full items-center gap-2.5 rounded-full border px-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl active:scale-[.98]"
            style={{ borderColor: `${cor}55`, backgroundColor: 'rgba(11,19,35,0.82)' }}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_10px_currentColor]" style={{ color: cor, backgroundColor: cor }} />
            <span className="truncate font-label text-xs uppercase tracking-[0.12em] text-on-surface">{selecionado.nome || 'Mapa natal'}</span>
            <span className="material-symbols-outlined text-lg text-outline">tune</span>
          </button>
        </div>
      )}

      <BottomSheet aberto={aberto} onFechar={onFechar} titulo="Mapa em observação">
        {selecionado && (
          <Link
            to={`/mapa/${selecionado.id}`}
            onClick={onFechar}
            className="mb-4 flex items-center gap-3 rounded-2xl border p-3.5 active:bg-white/5"
            style={{ borderColor: `${cor}55`, backgroundColor: `${cor}12` }}
          >
            <span className="material-symbols-outlined text-3xl" style={{ color: cor }}>person_pin_circle</span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate font-headline text-base text-on-surface">{selecionado.nome || 'Mapa natal'}</strong>
              <small className="font-label text-[10px] uppercase tracking-wider" style={{ color: cor }}>{selecionado.principal ? 'Mapa principal' : `Mapa #${selecionado.id}`}</small>
            </span>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Link>
        )}

        {mapas.length > 1 && (
          <>
            <p className="mb-2 px-1 font-label text-[10px] uppercase tracking-widest text-outline">Trocar de mapa</p>
            <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5">
              {mapas.map((mapa, index) => {
                const corMapa = corDoMapa(index)
                const ativo = mapa.id === selecionado?.id
                return (
                  <button
                    key={mapa.id}
                    type="button"
                    onClick={() => escolherMapa(mapa)}
                    aria-pressed={ativo}
                    className="flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm"
                    style={ativo ? { borderColor: `${corMapa}88`, backgroundColor: `${corMapa}1f`, color: corMapa } : { borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: corMapa }} />
                    <span className="max-w-[9rem] truncate">{mapa.nome || 'Mapa natal'}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        <p className="mb-2 px-1 font-label text-[10px] uppercase tracking-widest text-outline">Detalhes celestes</p>
        <nav className="grid grid-cols-2 gap-2">
          {detalhesMapa.map((item) => {
            const ativo = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onFechar}
                className={`flex min-h-[64px] flex-col justify-center gap-1 rounded-2xl border p-3 active:bg-white/10 ${ativo ? 'bg-white/[.07]' : 'border-white/[.06] bg-white/[.03] text-on-surface-variant'}`}
                style={ativo ? { color: cor, borderColor: `${cor}55` } : undefined}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="font-label text-[11px] uppercase leading-tight">{item.label}</span>
              </Link>
            )
          })}
          <Link to="/meus-mapas" onClick={onFechar} className="flex min-h-[64px] flex-col justify-center gap-1 rounded-2xl border border-white/[.06] bg-white/[.03] p-3 text-on-surface-variant active:bg-white/10">
            <span className="material-symbols-outlined text-xl">folder_supervised</span>
            <span className="font-label text-[11px] uppercase leading-tight">Gerenciar mapas</span>
          </Link>
        </nav>

        {erroExportacao && <p className="mt-4 rounded-lg border border-error/20 bg-error/10 p-2 text-center text-xs text-error">{erroExportacao}</p>}
        <button
          type="button"
          onClick={exportarPdf}
          disabled={exportando || !selecionado}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full font-label text-xs uppercase tracking-[0.08em] shadow-[0_12px_30px_rgba(0,0,0,0.28)] active:scale-[.98] disabled:opacity-60"
          style={{ backgroundColor: cor, color: '#1a1220' }}
        >
          <span className={`material-symbols-outlined text-base ${exportando ? 'animate-spin' : ''}`}>{exportando ? 'progress_activity' : 'download'}</span>
          <span className="truncate">{exportando ? 'Gerando PDF…' : `Exportar ${selecionado?.nome || 'mapa'}`}</span>
        </button>
        <p className="mt-2 text-center font-label text-[9px] uppercase tracking-wider text-outline">PDF · máximo 15 MB</p>
      </BottomSheet>
    </>
  )
}
