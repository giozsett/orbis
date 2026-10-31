// Moldura com cantos em colchete e brilho que percorre o texto,
// o mesmo destaque do wordmark ORBIS da tela de login.
export default function TituloMoldurado({ children, className = '', style }) {
  return (
    <div
      style={style}
      className={`relative inline-block px-5 py-3 motion-safe:animate-orbis-rise motion-safe:before:animate-orbis-bracket motion-safe:after:animate-orbis-bracket before:absolute before:left-0 before:top-0 before:h-[26px] before:w-[26px] before:border-l-2 before:border-t-2 before:border-primary before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-[26px] after:w-[26px] after:border-b-2 after:border-r-2 after:border-primary after:content-[''] md:px-7 md:py-4 ${className}`}
    >
      <h1 className="bg-orbis-wordmark bg-[length:250%_100%] bg-clip-text font-headline text-4xl font-bold leading-[1.02] tracking-[0.02em] text-transparent motion-safe:animate-orbis-shimmer md:text-5xl">
        {children}
      </h1>
    </div>
  )
}
