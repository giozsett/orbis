import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MandalaLoading from '../components/mandala/MandalaLoading'
import FundoOrbis from '../components/ui/FundoOrbis'

export default function Carregando() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/mapa')
    }, 4000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
      <FundoOrbis />

      <main className="relative z-[2] flex flex-col items-center justify-center p-6 sm:p-8">
        <MandalaLoading />

        <div className="mt-10 flex max-w-lg flex-col items-center text-center">
          <h1 className="bg-orbis-wordmark bg-[length:250%_100%] bg-clip-text font-headline text-5xl font-medium tracking-[0.01em] text-transparent motion-safe:[animation:orbis-rise_0.9s_cubic-bezier(0.22,1,0.36,1)_both,orbis-shimmer_7s_ease-in-out_1.2s_infinite]">
            ORBIS
          </h1>
          <p className="mt-4 font-label text-xs uppercase tracking-[0.22em] text-outline motion-safe:animate-orbis-twinkle">
            Calculando órbitas e alinhamentos
          </p>
          <div className="relative mt-4 h-px w-48 overflow-hidden bg-white/10">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-orbis-cta motion-safe:animate-[progress-scroll_1.5s_linear_infinite]" />
          </div>
        </div>

        <div className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] flex flex-wrap justify-center gap-2 px-4 sm:gap-4">
          {[['blur_on', 'DATA_STREAM_SYNC'], ['public', 'EPOCH_2024.4']].map(([icone, rotulo], i) => (
            <div key={rotulo} className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface-container-low/50 px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.18em] text-outline backdrop-blur-sm motion-safe:animate-orbis-rise" style={{ animationDelay: `${700 + i * 150}ms` }}>
              <span className="material-symbols-outlined text-sm">{icone}</span>
              <span>{rotulo}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
