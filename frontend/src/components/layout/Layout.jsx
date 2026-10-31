import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'
import FundoOrbis from '../ui/FundoOrbis'
import { useLocation } from 'react-router-dom'

export default function Layout({ children, showSidebar = true, showFooter = true }) {
  const location = useLocation()
  const exibeMenuTematico = location.pathname.startsWith('/horoscopos-malucos')

  return (
    <div className="relative min-h-screen text-on-background">
      <FundoOrbis faixa={!showSidebar} />
      <TopNav />
      {showSidebar && <Sidebar />}
      <main className={`relative z-[2] ${showSidebar ? 'lg:ml-80' : ''} ${exibeMenuTematico ? 'pt-28' : 'pt-16'} min-h-screen`}>
        {children}
      </main>
      {showFooter && <Footer comSidebar={showSidebar} />}
    </div>
  )
}
