import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { icon: 'blur_on', label: 'Dados planetários', path: '/mapa/posicoes' },
  { icon: 'grid_4x4', label: 'Grade de aspectos', path: '/mapa/aspectos' },
  { icon: 'home_pin', label: 'Casas', path: '/mapa/casas' },
  { icon: 'settings_backup_restore', label: 'Retrógrados', path: '/mapa/retrogrados' },
  { icon: 'star', label: 'Asteroides', path: '/mapa/asteroides' },
]

export default function Sidebar() {
  const location = useLocation()
  const [exportando, setExportando] = useState(false)
  const [erroExportacao, setErroExportacao] = useState('')

  const exportarPdf = async () => {
    if (exportando) return
    setExportando(true)
    setErroExportacao('')
    try {
      const response = await fetch('/mapas/principal/exportacao?formato=pdf', { credentials: 'include' })
      const tipo = response.headers.get('content-type') || ''
      if (!response.ok || !tipo.includes('application/pdf')) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.erro || 'Não foi possível gerar o PDF.')
      }
      const arquivo = await response.blob()
      if (arquivo.size > 15 * 1024 * 1024) throw new Error('O relatório excedeu o limite de 15 MB.')
      const url = URL.createObjectURL(arquivo)
      const link = document.createElement('a')
      link.href = url
      link.download = 'orbis-efemerides.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setErroExportacao(error.message)
    } finally {
      setExportando(false)
    }
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 p-6 flex flex-col bg-surface-container-low/60 backdrop-blur-lg border-r border-white/10 w-80 hidden lg:flex">
      <div className="mb-12">
        <h3 className="text-secondary font-headline text-lg">Detalhes Celestes</h3>
        <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">Dados do mapa principal</p>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <Link
          to="/meus-mapas"
          className={`mb-4 flex items-center gap-4 rounded-lg border p-3 text-left transition-all duration-300 group ${
            location.pathname === '/meus-mapas'
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-white/5 bg-white/[0.03] text-on-surface-variant hover:border-primary/20 hover:bg-primary/5 hover:text-secondary'
          }`}
        >
          <span className="material-symbols-outlined transition-transform group-hover:scale-110">folder_supervised</span>
          <span className="font-label text-sm uppercase">Meus Mapas</span>
        </Link>

        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 text-left group ${
              location.pathname === item.path
                ? 'text-secondary bg-secondary-container/20'
                : 'text-on-surface-variant hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="font-label text-sm uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>

      {erroExportacao && <p className="mb-2 rounded-lg border border-error/20 bg-error/10 p-2 text-center text-xs text-error">{erroExportacao}</p>}
      <button onClick={exportarPdf} disabled={exportando} className="mt-2 w-full py-3 bg-primary text-on-primary font-label text-sm rounded-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
        <span className={`material-symbols-outlined text-sm ${exportando ? 'animate-spin' : ''}`}>{exportando ? 'progress_activity' : 'download'}</span>
        {exportando ? 'Gerando PDF…' : 'Exportar efemérides'}
      </button>
      <p className="mt-2 text-center font-label text-[9px] uppercase tracking-wider text-outline">PDF · máximo 15 MB</p>
    </aside>
  )
}
