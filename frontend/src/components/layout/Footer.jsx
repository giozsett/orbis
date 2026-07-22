export default function Footer() {
  return (
    <footer className="lg:ml-80 w-full py-6 px-16 flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest border-t border-white/5 relative z-20">
      <div className="mb-4 md:mb-0">
        <span className="font-label text-xs text-on-surface uppercase opacity-70">
          © 2024 Orbis Astronomical Observatory
        </span>
      </div>
      <nav className="flex gap-6">
        <a href="#" className="text-sm text-outline hover:text-primary transition-colors">
          Data Sources
        </a>
        <a href="#" className="text-sm text-outline hover:text-primary transition-colors">
          Privacy
        </a>
        <a href="#" className="text-sm text-outline hover:text-primary transition-colors">
          Methodology
        </a>
      </nav>
    </footer>
  )
}
