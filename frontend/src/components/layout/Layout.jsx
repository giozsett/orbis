import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout({ children, showSidebar = true, showFooter = true }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav />
      {showSidebar && <Sidebar />}
      <main className={`${showSidebar ? 'lg:ml-80' : ''} pt-16 min-h-screen`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
