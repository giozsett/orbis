import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { icon: 'blur_on', label: 'Planetary Data' },
  { icon: 'grid_4x4', label: 'Aspect Grid' },
  { icon: 'home_pin', label: 'Houses' },
  { icon: 'settings_backup_restore', label: 'Retrogrades' },
  { icon: 'star', label: 'Asteroids' },
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState(0)
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 p-6 flex flex-col bg-surface-container-low/60 backdrop-blur-lg border-r border-white/10 w-80 hidden lg:flex">
      <div className="mb-12">
        <h3 className="text-secondary font-headline text-lg">Celestial Details</h3>
        <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">Current Planetary Positions</p>
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

        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(index)}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 text-left group ${
              activeItem === index
                ? 'text-secondary bg-secondary-container/20'
                : 'text-on-surface-variant hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="font-label text-sm uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="mt-6 w-full py-3 bg-primary text-on-primary font-label text-sm rounded-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm">download</span>
        Export Ephemeris
      </button>
    </aside>
  )
}
