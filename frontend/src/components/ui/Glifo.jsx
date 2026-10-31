import { FONTE_GLIFOS, TXT } from '../../utils/glifos'

// Glifo astrológico em texto, com a mesma fonte da mandala (nunca como emoji colorido)
export default function Glifo({ simbolo, className = '', style, titulo }) {
  return (
    <span
      className={`inline-block leading-none ${className}`}
      style={{ fontFamily: FONTE_GLIFOS, fontWeight: 600, fontVariantEmoji: 'text', ...style }}
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
    >
      {simbolo + TXT}
    </span>
  )
}
