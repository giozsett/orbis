export default function Footer({ comSidebar = true }) {
  return (
    <footer className={`${comSidebar ? 'lg:pl-96' : ''} relative z-20 hidden w-full lg:flex flex-col items-center justify-between gap-4 border-t border-veu/[0.08] bg-surface/45 px-6 py-6 backdrop-blur-[18px] md:flex-row md:px-16`}>
      <span className="font-marca text-sm tracking-[0.16em] text-secondary">ORBIS</span>
      <nav className="flex gap-6">
        <a href="#" className="orbis-link text-sm text-outline hover:text-primary">
          Fontes de dados
        </a>
        <a href="#" className="orbis-link text-sm text-outline hover:text-primary">
          Privacidade
        </a>
        <a href="#" className="orbis-link text-sm text-outline hover:text-primary">
          Metodologia
        </a>
      </nav>
    </footer>
  )
}
