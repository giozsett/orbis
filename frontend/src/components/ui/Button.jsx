export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  ...props 
}) {
  const baseStyles = 'font-label rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-95'
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(255,0,122,0.4)]',
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
