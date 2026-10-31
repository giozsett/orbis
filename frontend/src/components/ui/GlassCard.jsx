import { useRef, useCallback } from 'react'

// Brilho que segue o cursor só faz sentido com mouse; no toque ele ficaria "preso" no último ponto
const temHover = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches

export default function GlassCard({ children, className = '', magnetic = false, ...props }) {
  const cardRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!magnetic || !cardRef.current || !temHover()) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
    cardRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 75, 137, 0.1), rgba(184, 109, 253, 0.04) 30%, rgba(6, 14, 29, 0.68) 60%)`
  }, [magnetic])

  // Limpa o estilo inline para voltar ao fundo definido em .glass-card
  const handleMouseLeave = useCallback(() => {
    if (!magnetic || !cardRef.current) return
    cardRef.current.style.background = ''
  }, [magnetic])

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-2xl transition-all duration-300 ${magnetic ? 'glass-card-magnetic lg:cursor-pointer' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  )
}
