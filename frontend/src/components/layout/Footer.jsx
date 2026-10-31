export default function Footer({ comSidebar = true }) {
  return (
    <footer className={`${comSidebar ? 'lg:pl-96' : ''} relative z-20 flex w-full flex-col items-center justify-between gap-4 border-t border-white/[0.08] bg-surface/45 px-6 py-6 backdrop-blur-[18px] md:flex-row md:px-16`}>
      <span className="rounded-full border border-white/[0.08] bg-surface-container-low/50 px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.18em] text-outline">
        ORBIS · mapa natal
      </span>
      <nav className="flex gap-6">
        <a href="#" className="font-label text-xs uppercase tracking-[0.08em] text-outline transition-colors hover:text-primary">
          Data Sources
        </a>
        <a href="#" className="font-label text-xs uppercase tracking-[0.08em] text-outline transition-colors hover:text-primary">
          Privacy
        </a>
        <a href="#" className="font-label text-xs uppercase tracking-[0.08em] text-outline transition-colors hover:text-primary">
          Methodology
        </a>
      </nav>
    </footer>
  )
}
