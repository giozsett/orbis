import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LinuxTuxIcon from '../icons/LinuxTuxIcon'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/meus-mapas', label: 'Meus mapas' },
  { path: '/horoscopo', label: 'Horóscopo' },
  { path: '/horoscopos-malucos', label: 'Horóscopos Malucos' },
  { path: '/chat', label: 'Chat Astral' },
  { path: '/interpretacoes', label: 'Interpretações' },
  { path: '/mapa', label: 'Mapa natal' },
]

const temasMalucos = [
  { path: '/horoscopos-malucos', label: 'Distros Linux', icon: 'linux' },
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuRef = useRef(null)

  const isHoroscoposMalucosRota = location.pathname.startsWith('/horoscopos-malucos')

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setIsUserMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false)
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
    setIsMobileMenuOpen(false)
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

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-16 h-16 bg-surface/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4 xl:gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            <span className="font-headline text-2xl font-bold tracking-tighter text-secondary">ORBIS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-label text-xs lg:text-sm transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(open => !open)}
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
                className="absolute right-0 top-12 w-52 glass-panel rounded-xl border border-white/10 p-2 shadow-2xl animate-user-menu origin-top-right"
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
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu de navegação"
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

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="absolute top-16 right-0 w-64 bg-surface-container-low border-l border-white/10 p-6 flex flex-col gap-4 animate-slide-in-right">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-label text-sm p-3 rounded-lg transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant hover:text-secondary hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isHoroscoposMalucosRota && (
              <div className="border-t border-white/5 pt-3 mt-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline px-3 mb-2">Temas</p>
                {temasMalucos.map((tema) => (
                  <Link
                    key={tema.path}
                    to={tema.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 font-label text-sm p-3 rounded-lg transition-colors duration-300 text-on-surface-variant hover:text-secondary hover:bg-white/5 min-h-[44px]"
                  >
                    <LinuxTuxIcon size={18} />
                    {tema.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
