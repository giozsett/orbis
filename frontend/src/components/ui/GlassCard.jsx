import { useRef, useCallback } from 'react'

export default function GlassCard({ children, className = '', magnetic = false, ...props }) {
  const cardRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!magnetic || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
    cardRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(234, 185, 206, 0.08), transparent 40%)`
  }, [magnetic])

  const handleMouseLeave = useCallback(() => {
    if (!magnetic || !cardRef.current) return
    cardRef.current.style.background = 'rgba(24, 32, 47, 0.6)'
  }, [magnetic])

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-xl transition-all duration-300 ${magnetic ? 'glass-card-magnetic cursor-pointer' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  )
}
