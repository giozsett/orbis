import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Folha inferior do mobile: desliza de baixo, fecha no fundo, no Esc ou arrastando a alça para baixo.
// Vai para o body via portal para ficar acima da barra superior e da tab bar.
export default function BottomSheet({ aberto, onFechar, titulo, children, className = '' }) {
  const painelRef = useRef(null)
  const inicioToque = useRef(null)
  const [arraste, setArraste] = useState(0)

  useEffect(() => {
    if (!aberto) return undefined
    const fecharNoEsc = (evento) => evento.key === 'Escape' && onFechar()
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', fecharNoEsc)
    painelRef.current?.focus()
    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', fecharNoEsc)
    }
  }, [aberto, onFechar])

  useEffect(() => { if (!aberto) setArraste(0) }, [aberto])

  if (!aberto) return null

  const tocar = (evento) => { inicioToque.current = evento.touches[0].clientY }
  const mover = (evento) => {
    if (inicioToque.current == null) return
    setArraste(Math.max(0, evento.touches[0].clientY - inicioToque.current))
  }
  const soltar = () => {
    if (arraste > 90) onFechar()
    else setArraste(0)
    inicioToque.current = null
  }

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="presentation">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-fade-in" onClick={onFechar} />
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-veu/10 bg-surface-container-lowest/[.97] shadow-[0_-24px_60px_rgba(0,0,0,0.5)] outline-none backdrop-blur-xl animate-sheet-up ${className}`}
        style={arraste ? { transform: `translateY(${arraste}px)`, transition: 'none' } : undefined}
      >
        <div className="shrink-0 touch-none px-5 pb-2 pt-3" onTouchStart={tocar} onTouchMove={mover} onTouchEnd={soltar}>
          <div className="mx-auto h-1.5 w-10 rounded-full bg-veu/20" />
          <div className="mt-3 flex items-center justify-between">
            <span className="font-headline text-lg text-on-surface">{titulo}</span>
            <button type="button" onClick={onFechar} aria-label="Fechar" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant active:bg-veu/10">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-safe">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
