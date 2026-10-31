export default function GlassPanel({ children, className = '', ...props }) {
  return (
    <div
      className={`glass-panel rounded-[28px] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
