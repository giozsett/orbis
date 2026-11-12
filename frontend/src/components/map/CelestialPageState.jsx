import Layout from '../layout/Layout'
import GlassPanel from '../ui/GlassPanel'
import EsferaArmilar from '../ui/EsferaArmilar'
import TituloMoldurado from '../ui/TituloMoldurado'

// Mesmo carregamento da tela de login: esfera armilar flutuando e texto cintilando.
export function CelestialLoading({ texto = 'Organizando coordenadas celestes' }) {
  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-64px)] flex-col items-center justify-center gap-8 p-8">
        <div className="motion-safe:animate-orbis-float">
          <EsferaArmilar animada className="h-48 w-48 opacity-80 motion-safe:animate-orbis-sphere-in" />
        </div>
        <p className="text-center font-label text-xs uppercase tracking-[0.22em] text-outline motion-safe:animate-orbis-twinkle">{texto}</p>
      </div>
    </Layout>
  )
}

export function CelestialError({ mensagem }) {
  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-64px)] items-center justify-center p-8">
        <GlassPanel className="max-w-lg p-7 text-center md:p-10 motion-safe:animate-orbis-card-in">
          <span className="material-symbols-outlined text-5xl text-error motion-safe:animate-orbis-shake">orbit</span>
          <h1 className="mt-4 font-headline text-2xl">Coordenadas indisponíveis</h1>
          <p className="mt-3 text-on-surface-variant">{mensagem}</p>
        </GlassPanel>
      </div>
    </Layout>
  )
}

export function TechnicalHeader({ mapa, eyebrow, titulo, descricao, icone }) {
  return (
    <header className="relative mb-6 overflow-hidden rounded-[24px] border border-veu/10 bg-surface-container-lowest/75 p-5 xs:p-6 md:mb-10 md:rounded-[28px] shadow-[var(--sombra-vidro)] backdrop-blur-xl motion-safe:animate-orbis-card-in md:p-10">
      <div className="pointer-events-none absolute -right-16 -top-16 w-48 opacity-20 md:w-72 md:opacity-25">
        <EsferaArmilar animada className="w-full" />
      </div>
      <span className="material-symbols-outlined absolute bottom-6 right-8 hidden text-6xl md:block text-primary/10 motion-safe:animate-orbis-float">{icone}</span>
      <div className="relative z-10">
        <p className="mb-4 font-label text-[11px] uppercase tracking-[0.32em] text-primary motion-safe:animate-orbis-rise sm:text-xs" style={{ animationDelay: '150ms' }}>{eyebrow} · {mapa.nome}</p>
        <TituloMoldurado style={{ animationDelay: '280ms' }}>{titulo}</TituloMoldurado>
        <p className="mt-4 max-w-3xl text-sm leading-[1.7] text-on-surface-variant md:mt-5 md:text-base motion-safe:animate-orbis-rise" style={{ animationDelay: '430ms' }}>{descricao}</p>
      </div>
    </header>
  )
}
