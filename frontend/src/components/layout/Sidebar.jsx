import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { corDoMapa, lerCorMapaSelecionado, lerMapaSelecionado, observarMapaSelecionado, salvarCorMapaSelecionado, selecionarMapa } from '../../hooks/useMapaSelecionado'

const menuItems = [
  { icon: 'blur_on', label: 'Dados planetários', path: '/mapa/posicoes' },
  { icon: 'grid_4x4', label: 'Grade de aspectos', path: '/mapa/aspectos' },
  { icon: 'home_pin', label: 'Casas', path: '/mapa/casas' },
  { icon: 'settings_backup_restore', label: 'Retrógrados', path: '/mapa/retrogrados' },
  { icon: 'star', label: 'Asteroides', path: '/mapa/asteroides' },
]

function nomeArquivo(nome) {
  const seguro = (nome || 'mapa').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `orbis-${seguro || 'mapa'}.pdf`
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mapas, setMapas] = useState([])
  const [mapaId, setMapaId] = useState(lerMapaSelecionado)
  const [corPersistida, setCorPersistida] = useState(lerCorMapaSelecionado)
  const [menuAberto, setMenuAberto] = useState(location.pathname === '/meus-mapas')
  const [exportando, setExportando] = useState(false)
  const [erroExportacao, setErroExportacao] = useState('')

  useEffect(() => observarMapaSelecionado(setMapaId), [])
  useEffect(() => {
    fetch('/mapas', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) return { mapas: [] }
        return response.json()
      })
      .then(({ mapas: recebidos = [] }) => {
        setMapas(recebidos)
        const salvo = lerMapaSelecionado()
        const valido = recebidos.some(mapa => mapa.id === salvo)
        if (!valido && recebidos[0]) selecionarMapa(recebidos[0].id, corDoMapa(0))
      })
      .catch(() => setMapas([]))
  }, [])

  const selecionado = useMemo(() => mapas.find(mapa => mapa.id === mapaId) || mapas[0], [mapas, mapaId])
  const indiceSelecionado = Math.max(0, mapas.findIndex(mapa => mapa.id === selecionado?.id))
  const cor = selecionado ? corDoMapa(indiceSelecionado) : corPersistida

  useEffect(() => {
    if (!selecionado) return
    const novaCor = corDoMapa(indiceSelecionado)
    setCorPersistida(novaCor)
    salvarCorMapaSelecionado(novaCor)
  }, [indiceSelecionado, selecionado])

  const escolherMapa = (mapa) => {
    const novaCor = corDoMapa(Math.max(0, mapas.findIndex(item => item.id === mapa.id)))
    setCorPersistida(novaCor)
    selecionarMapa(mapa.id, novaCor)
    setMenuAberto(false)
    if (/^\/mapa\/\d+$/.test(location.pathname) || location.pathname === '/mapa') navigate(`/mapa/${mapa.id}`)
  }

  const exportarPdf = async () => {
    if (exportando || !selecionado) return
    setExportando(true); setErroExportacao('')
    try {
      const response = await fetch(`/mapas/${selecionado.id}/exportacao?formato=pdf`, { credentials: 'include' })
      const tipo = response.headers.get('content-type') || ''
      if (!response.ok || !tipo.includes('application/pdf')) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.erro || 'Não foi possível gerar o PDF.')
      }
      const arquivo = await response.blob()
      if (arquivo.size > 15 * 1024 * 1024) throw new Error('O relatório excedeu o limite de 15 MB.')
      const url = URL.createObjectURL(arquivo)
      const link = Object.assign(document.createElement('a'), { href: url, download: nomeArquivo(selecionado.nome) })
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
    } catch (error) { setErroExportacao(error.message) } finally { setExportando(false) }
  }

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] w-80 flex-col border-r border-white/10 bg-surface-container-low/60 p-6 backdrop-blur-lg lg:flex" style={{ '--map-accent': cor }}>
      <div className="mb-5">
        <h3 className="font-headline text-lg" style={{ color: cor }}>Detalhes Celestes</h3>
        <p className="mt-1 text-xs uppercase tracking-widest text-on-surface-variant">Mapa em observação</p>
      </div>

      {selecionado && <Link to={`/mapa/${selecionado.id}`} className="mb-3 flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5" style={{ borderColor: `${cor}55`, backgroundColor: `${cor}12` }}>
        <span className="material-symbols-outlined text-3xl" style={{ color: cor }}>person_pin_circle</span>
        <span className="min-w-0"><strong className="block truncate font-headline text-base text-on-surface">{selecionado.nome || 'Mapa natal'}</strong><small className="font-label text-[9px] uppercase tracking-wider" style={{ color: cor }}>{selecionado.principal ? 'Mapa principal' : `Mapa #${selecionado.id}`}</small></span>
      </Link>}

      <button type="button" onClick={() => setMenuAberto(aberto => !aberto)} aria-expanded={menuAberto} className="mb-3 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[.03] p-3 text-left text-on-surface-variant transition-all hover:bg-white/[.06]">
        <span className="material-symbols-outlined">folder_supervised</span><span className="flex-1 font-label text-sm uppercase">Meus mapas</span><span className={`material-symbols-outlined text-lg transition-transform ${menuAberto ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {menuAberto && <div className="custom-scrollbar mb-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/5 bg-surface-container-lowest/60 p-2 animate-fade-in" role="menu">
        {mapas.map((mapa, index) => { const corMapa = corDoMapa(index); const ativo = mapa.id === selecionado?.id; return <button key={mapa.id} type="button" role="menuitem" onClick={() => escolherMapa(mapa)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5" style={ativo ? { backgroundColor: `${corMapa}15` } : undefined}><span className="h-3 w-3 shrink-0 rounded-full shadow-[0_0_10px_currentColor]" style={{ color: corMapa, backgroundColor: corMapa }} /><span className="min-w-0 flex-1 truncate text-sm" style={{ color: ativo ? corMapa : undefined }}>{mapa.nome || 'Mapa natal'}</span>{mapa.principal && <span className="material-symbols-outlined text-sm text-primary" title="Mapa principal">auto_awesome</span>}</button> })}
        <Link to="/meus-mapas" className="mt-1 flex items-center justify-center gap-2 border-t border-white/5 pt-3 font-label text-[10px] uppercase tracking-wider text-outline hover:text-on-surface">Gerenciar mapas<span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
      </div>}

      <nav className="custom-scrollbar flex flex-grow flex-col gap-2 overflow-y-auto pr-1">
        {menuItems.map(item => <Link key={item.label} to={item.path} className={`group flex items-center gap-4 rounded-lg p-3 text-left transition-all duration-300 ${location.pathname === item.path ? 'bg-white/[.07]' : 'text-on-surface-variant hover:bg-white/5'}`} style={location.pathname === item.path ? { color: cor } : undefined}><span className="material-symbols-outlined transition-transform group-hover:scale-110">{item.icon}</span><span className="font-label text-sm uppercase">{item.label}</span></Link>)}
      </nav>

      {erroExportacao && <p className="mb-2 rounded-lg border border-error/20 bg-error/10 p-2 text-center text-xs text-error">{erroExportacao}</p>}
      <button onClick={exportarPdf} disabled={exportando || !selecionado} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-label text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60" style={{ backgroundColor: cor, color: '#1a1220' }}><span className={`material-symbols-outlined text-sm ${exportando ? 'animate-spin' : ''}`}>{exportando ? 'progress_activity' : 'download'}</span>{exportando ? 'Gerando PDF…' : `Exportar ${selecionado?.nome || 'mapa'}`}</button>
      <p className="mt-2 text-center font-label text-[9px] uppercase tracking-wider text-outline">PDF · máximo 15 MB</p>
    </aside>
  )
}
