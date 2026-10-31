import EsferaArmilar from '../ui/EsferaArmilar'

// Mesma esfera armilar animada do login, flutuando sobre um halo que respira.
export default function MandalaLoading() {
  return (
    <div className="relative flex h-64 w-64 items-center justify-center md:h-96 md:w-96">
      <div className="absolute inset-[15%] rounded-full bg-primary-container/20 blur-[64px] motion-safe:animate-orbis-twinkle" />
      <div className="relative h-full w-full motion-safe:animate-orbis-float">
        <EsferaArmilar animada className="h-full w-full motion-safe:animate-orbis-sphere-in" />
      </div>
    </div>
  )
}
