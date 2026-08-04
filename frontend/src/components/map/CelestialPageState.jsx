import Layout from '../layout/Layout'
import GlassPanel from '../ui/GlassPanel'

export function CelestialLoading({ texto = 'Organizando coordenadas celestes' }) {
  return (
    <Layout showFooter={false}>
      <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden p-8">
        <div className="absolute h-72 w-72 animate-pulse-soft rounded-full bg-primary/10 blur-[90px]" />
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div className="absolute inset-0 animate-rotate-slow rounded-full border border-dashed border-primary/30" />
          <div className="absolute inset-8 animate-rotate-reverse rounded-full border border-tertiary/30" />
          <div className="absolute inset-16 animate-pulse-glow rounded-full border border-secondary/40" />
          <span className="material-symbols-outlined animate-float text-5xl text-primary">auto_awesome</span>
        </div>
        <div className="absolute mt-80 text-center">
          <p className="font-label text-xs uppercase tracking-[0.25em] text-outline">{texto}</p>
          <div className="mx-auto mt-3 h-px w-32 overflow-hidden bg-white/5">
            <div className="h-full w-1/2 animate-[progress-scroll_1.4s_ease-in-out_infinite] bg-primary" />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export function CelestialError({ mensagem }) {
  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-8">
        <GlassPanel className="max-w-lg animate-scale-in p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-error">orbit</span>
          <h1 className="mt-4 font-headline text-2xl">Coordenadas indisponíveis</h1>
          <p className="mt-3 text-on-surface-variant">{mensagem}</p>
        </GlassPanel>
      </div>
    </Layout>
  )
}

export function TechnicalHeader({ mapa, eyebrow, titulo, descricao, icone }) {
  return (
    <header className="relative mb-10 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low/60 p-7 animate-fade-in-up md:p-10">
      <div className="absolute -right-12 -top-12 h-48 w-48 animate-pulse-soft rounded-full bg-primary/10 blur-3xl" />
      <span className="material-symbols-outlined absolute right-7 top-7 animate-float-slow text-7xl text-primary/10">{icone}</span>
      <div className="relative z-10">
        <p className="font-label text-xs uppercase tracking-[0.22em] text-primary">{eyebrow} · {mapa.nome}</p>
        <h1 className="mt-3 font-headline text-4xl text-on-surface md:text-5xl">{titulo}</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-on-surface-variant">{descricao}</p>
      </div>
    </header>
  )
}
