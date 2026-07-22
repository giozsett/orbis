import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MandalaLoading from '../components/mandala/MandalaLoading'

export default function Carregando() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/mapa')
    }, 4000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Partículas de fundo */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40" id="stardust" />

      {/* Texto e mandala */}
      <main className="relative z-20 flex flex-col items-center justify-center p-8">
        <MandalaLoading />

        <div className="mt-12 text-center space-y-4 max-w-lg">
          <h1 className="font-headline text-3xl text-on-surface tracking-tight animate-pulse-soft">
            ORBIS
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg text-secondary/80 flex items-center gap-2">
              Calculando órbitas e alinhamentos...
            </p>
            <div className="w-48 h-px bg-outline-variant relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary w-1/3"
                style={{ animation: 'progress-scroll 1.5s infinite linear' }}
              />
            </div>
          </div>
        </div>

        {/* Badges de status */}
        <div className="absolute bottom-8 flex gap-6">
          <div className="flex items-center gap-2 font-label text-xs text-outline px-4 py-1 bg-surface-container/40 rounded-full border border-white/5 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>blur_on</span>
            <span>DATA_STREAM_SYNC</span>
          </div>
          <div className="flex items-center gap-2 font-label text-xs text-outline px-4 py-1 bg-surface-container/40 rounded-full border border-white/5 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm">public</span>
            <span>EPOCH_2024.4</span>
          </div>
        </div>
      </main>

      {/* Textura de grão */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50" />
    </div>
  )
}
