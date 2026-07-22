import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/horoscopo', label: 'Horóscopo' },
  { path: '/interpretacoes', label: 'Interpretações' },
  { path: '/mapa', label: 'Mapa natal' },
]

export default function TopNav() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-16 h-16 bg-surface/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            <span className="font-headline text-2xl font-bold tracking-tighter text-secondary">ORBIS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-label text-sm transition-colors duration-300 ${
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
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? 'close' : 'menu'}
        </button>
      </header>

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
          </nav>
        </div>
      )}
    </>
  )
}
