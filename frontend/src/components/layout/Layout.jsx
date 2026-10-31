import { useCallback, useState } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'
import BottomNav from './BottomNav'
import MapaSheet from './MapaSheet'
import FundoOrbis from '../ui/FundoOrbis'
import { useLocation } from 'react-router-dom'
import { ehRotaMapa } from './navItems'

export default function Layout({ children, showSidebar = true, showFooter = true }) {
  const location = useLocation()
  const exibeMenuTematico = location.pathname.startsWith('/horoscopos-malucos')
  // Abaixo de lg a sidebar vira o chip + folha "Mapa em observação"
  const [mapaAberto, setMapaAberto] = useState(false)
  const abrirMapa = useCallback(() => setMapaAberto(true), [])
  const fecharMapa = useCallback(() => setMapaAberto(false), [])
  const mostrarChip = showSidebar && ehRotaMapa(location.pathname)

  return (
    <div className="relative min-h-dvh text-on-background">
      <FundoOrbis faixa={!showSidebar} />
      <TopNav />
      {showSidebar && <Sidebar />}
      <main className={`relative z-[2] ${showSidebar ? 'lg:ml-80' : ''} ${exibeMenuTematico ? 'pt-28' : 'pt-16'} min-h-dvh pb-tabbar lg:pb-0`}>
        {showSidebar && <MapaSheet aberto={mapaAberto} onAbrir={abrirMapa} onFechar={fecharMapa} mostrarChip={mostrarChip} />}
        {children}
      </main>
      {showFooter && <Footer comSidebar={showSidebar} />}
      <BottomNav comMapa={showSidebar} onAbrirMapa={abrirMapa} />
    </div>
  )
}
