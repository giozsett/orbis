import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useSidebarMapa from '../../hooks/useSidebarMapa'
import { corDoMapa } from '../../hooks/useMapaSelecionado'
import { detalhesMapa } from './navItems'
import { corTema } from '../../utils/tema'

export default function Sidebar() {
  const location = useLocation()
  const { mapas, selecionado, cor, escolherMapa: selecionar, exportarPdf, exportando, erroExportacao } = useSidebarMapa()
  const [menuAberto, setMenuAberto] = useState(location.pathname === '/meus-mapas')

  const escolherMapa = (mapa) => {
    selecionar(mapa)
    setMenuAberto(false)
  }

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100dvh-64px)] w-80 flex-col border-r border-veu/[0.08] bg-surface/45 p-6 backdrop-blur-[18px] motion-safe:animate-orbis-rise lg:flex" style={{ '--map-accent': cor }}>
      {/* faixa de destaque da borda, a mesma da tela de login, colada à sidebar */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-[220px] w-1.5 origin-bottom bg-gradient-to-b from-primary-container to-tertiary-container opacity-[.65] motion-safe:animate-orbis-edge" />
      <div className="mb-5">
        <p className="text-[13px] text-outline">Mapa em observação</p>
        <h3 className="mt-1 font-headline text-xl" style={{ color: cor }}>Detalhes celestes</h3>
      </div>

      {selecionado && <Link to={`/mapa/${selecionado.id}`} className="mb-3 flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-veu/5" style={{ borderColor: `${cor}55`, backgroundColor: `${cor}12` }}>
        <span className="material-symbols-outlined text-3xl" style={{ color: cor }}>person_pin_circle</span>
        <span className="min-w-0"><strong className="block truncate font-headline text-base text-on-surface">{selecionado.nome || 'Mapa natal'}</strong><small className="font-dados text-[11px]" style={{ color: cor }}>{selecionado.principal ? 'Mapa principal' : `Mapa #${selecionado.id}`}</small></span>
      </Link>}

      <button type="button" onClick={() => setMenuAberto(aberto => !aberto)} aria-expanded={menuAberto} className="mb-3 flex items-center gap-3 rounded-lg border border-veu/5 bg-veu/[.03] p-3 text-left text-on-surface-variant transition-all hover:bg-veu/[.06]">
        <span className="material-symbols-outlined">folder_supervised</span><span className="flex-1 font-label text-sm font-medium">Meus mapas</span><span className={`material-symbols-outlined text-lg transition-transform ${menuAberto ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {menuAberto && <div className="custom-scrollbar mb-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-veu/5 bg-surface-container-lowest/60 p-2 animate-fade-in" role="menu">
        {mapas.map((mapa, index) => { const corMapa = corTema(corDoMapa(index)); const ativo = mapa.id === selecionado?.id; return <button key={mapa.id} type="button" role="menuitem" onClick={() => escolherMapa(mapa)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-veu/5" style={ativo ? { backgroundColor: `${corMapa}15` } : undefined}><span className="h-3 w-3 shrink-0 rounded-full shadow-[0_0_10px_currentColor]" style={{ color: corMapa, backgroundColor: corMapa }} /><span className="min-w-0 flex-1 truncate text-sm" style={{ color: ativo ? corMapa : undefined }}>{mapa.nome || 'Mapa natal'}</span>{mapa.principal && <span className="material-symbols-outlined text-sm text-primary" title="Mapa principal">auto_awesome</span>}</button> })}
        <Link to="/meus-mapas" className="mt-1 flex items-center justify-center gap-2 border-t border-veu/5 pt-3 text-xs font-medium text-outline transition-colors hover:text-on-surface">Gerenciar mapas<span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
      </div>}

      <nav className="custom-scrollbar flex flex-grow flex-col gap-2 overflow-y-auto pr-1">
        {detalhesMapa.map(item => <Link key={item.label} to={item.path} className={`group flex items-center gap-4 rounded-lg p-3 text-left transition-all duration-300 ${location.pathname === item.path ? 'bg-veu/[.07] font-semibold' : 'text-on-surface-variant hover:bg-veu/5'}`} style={location.pathname === item.path ? { color: cor } : undefined}><span className="material-symbols-outlined transition-transform group-hover:scale-110">{item.icon}</span><span className="font-label text-sm font-medium">{item.label}</span></Link>)}
      </nav>

      {erroExportacao && <p className="mb-2 rounded-lg border border-error/20 bg-error/10 p-2 text-center text-xs text-error">{erroExportacao}</p>}
      <button onClick={exportarPdf} disabled={exportando || !selecionado} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 font-label text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-95 disabled:opacity-60" style={{ backgroundColor: cor, color: 'rgb(var(--c-surface))' }}><span className={`material-symbols-outlined text-sm ${exportando ? 'animate-spin' : ''}`}>{exportando ? 'progress_activity' : 'download'}</span>{exportando ? 'Gerando PDF…' : `Exportar ${selecionado?.nome || 'mapa'}`}</button>
      <p className="mt-2 text-center font-dados text-[11px] text-outline">PDF · máximo 15 MB</p>
    </aside>
  )
}
