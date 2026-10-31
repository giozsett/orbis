export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  ...props 
}) {
  const baseStyles = 'group relative overflow-hidden font-label uppercase tracking-[0.08em] rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-95'

  const variants = {
    primary: 'bg-orbis-cta text-white shadow-[0_12px_30px_rgba(255,75,137,0.28)] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(255,75,137,0.38)]',
    secondary: 'border border-secondary/30 text-secondary hover:bg-secondary/10',
    ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-white/5',
    outline: 'border border-white/10 text-on-surface hover:border-primary/60 hover:bg-primary/5',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* brilho que atravessa o botão no hover, como no CTA do login */}
      {variant === 'primary' && (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[350%]" />
      )}
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">{icon}</span>
      )}
    </button>
  )
}
