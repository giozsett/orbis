import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LinuxTuxIcon from '../icons/LinuxTuxIcon'

const mapaGroup = {
  id: 'mapa',
  label: 'Mapa Natal',
  match: (path) => path === '/mapa' || path.startsWith('/mapa/') || path === '/meus-mapas' || path === '/interpretacoes',
  items: [
    { path: '/mapa', label: 'Mapa principal', icon: 'explore' },
    { path: '/meus-mapas', label: 'Meus mapas', icon: 'folder_supervised' },
    { path: '/interpretacoes', label: 'Interpretações', icon: 'auto_stories' },
  ],
}

const horoscopoGroup = {
  id: 'horo',
  label: 'Horóscopo',
  match: (path) => path === '/horoscopo' || path.startsWith('/horoscopos-malucos'),
  items: [
    { path: '/horoscopo', label: 'Horóscopo do dia', icon: 'calendar_today' },
    { path: '/horoscopos-malucos', label: 'Horóscopos malucos', icon: 'psychology' },
  ],
}

const navGroups = [mapaGroup, horoscopoGroup]

const temasMalucos = [
  { path: '/horoscopos-malucos', label: 'Distros Linux', icon: 'linux' },
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)
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
    closeMobileMenu()
  }, [location.pathname])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await fetch('/acesso/logout', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
    } finally {
      setIsUserMenuOpen(false)
      setIsLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setExpandedGroup(null)
  }

  const toggleNavMenu = (id) => {
    setOpenMenu((atual) => (atual === id ? null : id))
    setIsUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen((aberto) => !aberto)
    setOpenMenu(null)
    closeMobileMenu()
  }

  const toggleMobileMenu = () => {
    const abrindo = !isMobileMenuOpen
    setIsMobileMenuOpen(abrindo)
    if (abrindo) setIsUserMenuOpen(false)
    else setExpandedGroup(null)
  }

  const linkClass = (ativo) =>
    `flex items-center gap-1 rounded-full border px-4 py-2 font-label text-xs lg:text-sm transition-colors duration-300 ${
      ativo
        ? 'border-primary/40 bg-primary/10 font-bold text-primary'
        : 'border-transparent text-on-surface-variant hover:bg-white/5 hover:text-secondary'
    }`

  const triggerClass = (ativo, aberto) =>
    `flex items-center gap-1 rounded-full border px-4 py-2 font-label text-xs lg:text-sm transition-colors duration-300 ${
      ativo
        ? 'border-primary/40 bg-primary/10 font-bold text-primary'
        : aberto
        ? 'border-transparent bg-white/[.07] text-on-surface'
        : 'border-transparent text-on-surface-variant hover:bg-white/5 hover:text-secondary'
    }`

  const dropItemClass = (ativo) =>
    `flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors duration-150 ${
      ativo ? 'bg-primary/15 font-bold text-on-surface' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
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
            className="absolute left-0 top-full mt-2 w-60 rounded-2xl border border-white/10 bg-surface-container-lowest/95 p-2 shadow-2xl backdrop-blur-xl animate-user-menu origin-top-left"
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

  const renderMobileGroup = (group) => {
    const ativo = group.match(location.pathname)
    const aberto = expandedGroup === group.id
    return (
      <div key={group.id}>
        <button
          type="button"
          onClick={() => setExpandedGroup((atual) => (atual === group.id ? null : group.id))}
          aria-expanded={aberto}
          className={`flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-colors duration-200 ${
            ativo ? 'border-primary/35 bg-primary/5' : 'border-white/8 bg-white/[.03] hover:border-primary/20'
          }`}
        >
          <span className="flex items-center justify-between">
            <span className={`font-headline text-sm font-semibold ${ativo ? 'text-primary' : 'text-on-surface'}`}>{group.label}</span>
            <span className={`material-symbols-outlined text-lg text-outline transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </span>
          <span className="font-body text-xs text-on-surface-variant">{group.items.map((item) => item.label).join(' · ')}</span>
        </button>

        {aberto && (
          <div className="mt-1 flex flex-col gap-0.5 pl-1.5">
            {group.items.map((item) => {
              const itemAtivo = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors duration-200 ${
                    itemAtivo ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg opacity-85">{item.icon}</span>
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
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-16 h-16 bg-surface/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4 xl:gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            <span className="font-headline text-2xl font-bold tracking-tighter text-secondary">ORBIS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 xl:gap-2">
            <Link to="/dashboard" className={linkClass(location.pathname === '/dashboard')}>
              Dashboard
            </Link>
            {navGroups.map(renderDesktopGroup)}
            <Link to="/chat" className={linkClass(location.pathname === '/chat')}>
              Chat Astral
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={toggleUserMenu}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="Abrir menu do usuário"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                isUserMenuOpen
                  ? 'bg-primary/15 border-primary/60 text-primary shadow-[0_0_18px_rgba(255,177,195,0.18)]'
                  : 'bg-surface-container-low border-white/10 text-on-surface-variant hover:text-secondary hover:border-secondary/40'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 w-52 rounded-xl border border-white/10 bg-surface-container-lowest/95 p-2 shadow-2xl backdrop-blur-xl animate-user-menu origin-top-right"
              >
                <div className="px-3 py-2 mb-1 border-b border-white/5">
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline">Sua conta</p>
                </div>
                <Link
                  to="/perfil"
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-on-surface-variant hover:text-secondary hover:bg-white/5 transition-colors"
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

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </header>

      {/* Submenu temático — somente em rotas /horoscopos-malucos */}
      {isHoroscoposMalucosRota && (
        <nav className="fixed top-16 left-0 right-0 z-40 hidden md:flex items-center gap-6 px-4 md:px-16 h-12 bg-surface-container-low/60 backdrop-blur-xl border-b border-white/5">
          {temasMalucos.map((tema) => (
            <Link
              key={tema.path}
              to={tema.path}
              className="flex items-center gap-2 font-label text-xs lg:text-sm transition-colors duration-300 text-on-surface-variant hover:text-secondary min-h-[44px]"
            >
              <LinuxTuxIcon size={18} />
              {tema.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Menu mobile — painel "Navegação" com os grupos já resumidos */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} />
          <div className="absolute top-16 inset-x-4 rounded-3xl border border-white/10 bg-surface-container-lowest/95 backdrop-blur-xl p-4 shadow-2xl animate-fade-in-up flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b border-white/5">
              <span className="font-label text-[10px] uppercase tracking-widest text-outline">Navegação</span>
              <button type="button" onClick={closeMobileMenu} aria-label="Fechar menu" className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className={`font-label text-sm p-3 rounded-lg transition-colors duration-300 ${
                location.pathname === '/dashboard' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-secondary hover:bg-white/5'
              }`}
            >
              Dashboard
            </Link>

            {navGroups.map(renderMobileGroup)}

            <Link
              to="/chat"
              onClick={closeMobileMenu}
              className={`font-label text-sm p-3 rounded-lg transition-colors duration-300 ${
                location.pathname === '/chat' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-secondary hover:bg-white/5'
              }`}
            >
              Chat Astral
            </Link>

            {isHoroscoposMalucosRota && (
              <div className="border-t border-white/5 pt-3 mt-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline px-3 mb-2">Temas</p>
                {temasMalucos.map((tema) => (
                  <Link
                    key={tema.path}
                    to={tema.path}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 font-label text-sm p-3 rounded-lg transition-colors duration-300 text-on-surface-variant hover:text-secondary hover:bg-white/5 min-h-[44px]"
                  >
                    <LinuxTuxIcon size={18} />
                    {tema.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
