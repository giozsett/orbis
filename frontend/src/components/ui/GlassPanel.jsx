export default function GlassPanel({ children, className = '', ...props }) {
  return (
    <div
      className={`glass-panel rounded-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
