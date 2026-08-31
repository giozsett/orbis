import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useLocation } from 'react-router-dom'

export default function Layout({ children, showSidebar = true, showFooter = true }) {
  const location = useLocation()
  const exibeMenuTematico = location.pathname.startsWith('/horoscopos-malucos')

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav />
      {showSidebar && <Sidebar />}
      <main className={`${showSidebar ? 'lg:ml-80' : ''} ${exibeMenuTematico ? 'pt-28' : 'pt-16'} min-h-screen`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
