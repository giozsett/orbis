import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LinuxTuxIcon from '../icons/LinuxTuxIcon'
import BotaoTema from '../ui/BotaoTema'
import { encerrarSessao, navGroups, temasMalucos } from './navItems'

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const userMenuRef = useRef(null)
  const navMenuRefs = useRef({})

  const isHoroscoposMalucosRota = location.pathname.startsWith('/horoscopos-malucos')

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setIsUserMenuOpen(false)
      setOpenMenu((atual) => (atual && !navMenuRefs.current[atual]?.contains(event.target) ? null : atual))
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
        setOpenMenu(null)
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  useEffect(() => {
    setIsUserMenuOpen(false)
    setOpenMenu(null)
  }, [location.pathname])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await encerrarSessao()
    setIsUserMenuOpen(false)
    setIsLoggingOut(false)
    navigate('/login', { replace: true })
  }

  const toggleNavMenu = (id) => {
    setOpenMenu((atual) => (atual === id ? null : id))
    setIsUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen((aberto) => !aberto)
    setOpenMenu(null)
  }

  const linkClass = (ativo) =>
    `flex items-center gap-1 rounded-full border px-4 py-2 font-label text-sm font-medium transition-colors duration-300 ${
      ativo
        ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
        : 'border-transparent text-on-surface-variant hover:bg-veu/5 hover:text-secondary'
    }`

  const triggerClass = (ativo, aberto) =>
    `flex items-center gap-1 rounded-full border px-4 py-2 font-label text-sm font-medium transition-colors duration-300 ${
      ativo
        ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
        : aberto
        ? 'border-transparent bg-veu/[.07] text-on-surface'
        : 'border-transparent text-on-surface-variant hover:bg-veu/5 hover:text-secondary'
    }`

  const dropItemClass = (ativo) =>
    `flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors duration-150 ${
      ativo ? 'bg-primary/15 font-semibold text-on-surface' : 'text-on-surface-variant hover:bg-veu/5 hover:text-on-surface'
    }`

  const renderDesktopGroup = (group) => {
    const ativo = group.match(location.pathname)
    const aberto = openMenu === group.id
    return (
      <div key={group.id} ref={(el) => (navMenuRefs.current[group.id] = el)} className="relative">
        <button
          type="button"
          onClick={() => toggleNavMenu(group.id)}
          aria-haspopup="menu"
          aria-expanded={aberto}
          className={triggerClass(ativo, aberto)}
        >
          {group.label}
          <span className={`material-symbols-outlined text-base transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {aberto && (
          <div
            role="menu"
            className="absolute left-0 top-full mt-2 w-60 rounded-2xl border border-veu/10 bg-surface-container-lowest/95 p-2 shadow-2xl backdrop-blur-xl animate-user-menu origin-top-left"
          >
            {group.items.map((item) => {
              const itemAtivo = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} role="menuitem" className={dropItemClass(itemAtivo)}>
                  <span className={`material-symbols-outlined text-lg ${itemAtivo ? 'text-primary' : 'text-on-surface-variant/80'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-16 h-16 bg-surface/45 backdrop-blur-[18px] border-b border-veu/[0.08] motion-safe:animate-orbis-header">
        <div className="flex items-center gap-4 xl:gap-8">
          <Link to="/dashboard" className="group flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px] transition-transform duration-700 ease-out group-hover:rotate-[24deg]">public</span>
            <span className="font-marca text-[22px] tracking-[0.16em] text-secondary">ORBIS</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link to="/dashboard" className={linkClass(location.pathname === '/dashboard')}>
              Dashboard
            </Link>
            {navGroups.map(renderDesktopGroup)}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <BotaoTema />
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={toggleUserMenu}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="Abrir menu do usuário"
              className={`w-11 h-11 lg:w-10 lg:h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                isUserMenuOpen
                  ? 'bg-primary/15 border-primary/60 text-primary shadow-[0_0_18px_rgb(var(--c-primary)/0.18)]'
                  : 'bg-surface-container-low border-veu/10 text-on-surface-variant hover:text-secondary hover:border-secondary/40'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 w-52 rounded-xl border border-veu/10 bg-surface-container-lowest/95 p-2 shadow-2xl backdrop-blur-xl animate-user-menu origin-top-right"
              >
                <div className="px-3 py-2 mb-1 border-b border-veu/5">
                  <p className="text-xs text-outline">Sua conta</p>
                </div>
                <Link
                  to="/perfil"
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-on-surface-variant hover:text-secondary hover:bg-veu/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">account_circle</span>
                  Meu Perfil
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  {isLoggingOut ? 'Saindo…' : 'Sair'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Submenu temático — somente em rotas /horoscopos-malucos */}
      {isHoroscoposMalucosRota && (
        <nav className="no-scrollbar fixed top-16 left-0 right-0 z-40 flex items-center gap-6 overflow-x-auto px-4 md:px-16 h-12 bg-surface-container-low/60 backdrop-blur-xl border-b border-veu/5">
          {temasMalucos.map((tema) => (
            <Link
              key={tema.path}
              to={tema.path}
              className="flex items-center gap-2 font-label text-sm font-medium transition-colors duration-300 text-on-surface-variant hover:text-secondary min-h-[44px]"
            >
              <LinuxTuxIcon size={18} />
              {tema.label}
            </Link>
          ))}
        </nav>
      )}

    </>
  )
}
