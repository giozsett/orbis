// Ilustração da esfera armilar (globo + anéis + engrenagem) do mockup da landing.
// Os dentes da engrenagem e as marcações de grau são calculados aqui para não
// repetir dezenas de coordenadas à mão no SVG.
const CENTRO = 300

function raio(angulo, r) {
  return [CENTRO + r * Math.cos(angulo), CENTRO + r * Math.sin(angulo)]
}

const DENTES = Array.from({ length: 36 }, (_, i) => i)
  .filter((i) => i % 3 === 0)
  .map((i) => {
    const angulo = (i / 36) * Math.PI * 2
    return [...raio(angulo, 244), ...raio(angulo, 265)]
  })

const MARCACOES = Array.from({ length: 72 }, (_, i) => {
  const angulo = (i / 72) * Math.PI * 2
  return [...raio(angulo, 220), ...raio(angulo, 230)]
})

// Com `animada`, anéis e engrenagem giram em velocidades diferentes, a luneta
// varre o céu e as estrelas cintilam. Tudo sob motion-safe, respeitando quem
// prefere movimento reduzido. O pivô de cada grupo é o centro do viewBox.
const PIVO = 'origin-[300px_300px]'

const ESTRELAS = [
  [90, 120, 2, '0s'],
  [130, 80, 1.4, '1.1s'],
  [520, 410, 2, '0.6s'],
  [70, 440, 1.6, '1.9s'],
  [540, 90, 1.4, '2.4s'],
]

export default function EsferaArmilar({ className = '', animada = false }) {
  const anim = (classes) => (animada ? `${PIVO} ${classes}` : undefined)

  return (
    <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* globo: paralelos e meridianos */}
      <g stroke="rgba(255,177,195,0.55)" strokeWidth="1.1">
        <circle cx="300" cy="300" r="118" />
        <ellipse cx="300" cy="255" rx="82" ry="16" opacity=".8" />
        <ellipse cx="300" cy="300" rx="118" ry="26" />
        <ellipse cx="300" cy="345" rx="82" ry="16" opacity=".8" />
        <ellipse cx="300" cy="300" rx="42" ry="118" />
      </g>
      {/* continentes em lineart */}
      <g stroke="rgba(219,226,248,0.75)" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M 260 232 C 250 224 236 226 230 236 C 222 244 224 254 232 258 C 226 266 230 276 240 278 C 238 288 246 296 256 292 C 262 300 274 300 278 290 C 288 292 296 284 292 274 C 300 270 300 258 292 252 C 296 242 288 232 278 234 C 274 226 264 224 260 232 Z" />
        <path d="M 322 268 C 316 278 318 292 326 300 C 322 312 328 326 338 330 C 336 342 344 352 354 348 C 360 356 372 354 374 344 C 382 340 384 328 378 320 C 384 310 380 296 370 292 C 372 280 364 270 354 272 C 350 264 338 260 332 266 C 328 262 322 262 322 268 Z" />
        <path d="M 246 330 C 240 338 242 348 250 352 C 248 360 254 368 262 366 C 266 372 276 370 278 362 C 284 360 286 350 280 344 C 282 336 276 328 268 330 C 264 324 252 324 246 330 Z" />
      </g>
      {/* eixo de rotação */}
      <line x1="300" y1="176" x2="300" y2="424" stroke="rgba(217,176,107,0.55)" strokeWidth="1.6" strokeDasharray="1 5" />

      {/* anéis da esfera armilar (o grupo gira; a inclinação fica no elemento) */}
      <ellipse cx="300" cy="300" rx="230" ry="230" stroke="rgba(222,183,255,0.5)" strokeWidth="1.4" />
      <g className={anim('motion-safe:animate-orbis-ring-a')}>
        <ellipse cx="300" cy="300" rx="230" ry="90" stroke="rgba(184,109,253,0.55)" strokeWidth="1.6" transform="rotate(-18 300 300)" />
      </g>
      <g className={anim('motion-safe:animate-orbis-ring-b')}>
        <ellipse cx="300" cy="300" rx="230" ry="90" stroke="rgba(255,75,137,0.5)" strokeWidth="1.6" transform="rotate(35 300 300)" />
      </g>
      <ellipse cx="300" cy="300" rx="180" ry="180" stroke="rgba(229,188,196,0.35)" strokeWidth="1" strokeDasharray="2 6" className={anim('motion-safe:animate-orbis-spin-rev')} />

      {/* aro externo dentado */}
      <g className={anim('motion-safe:animate-orbis-spin-slow')}>
        <circle cx="300" cy="300" r="255" stroke="rgba(217,176,107,0.55)" strokeWidth="1.4" />
        <g stroke="rgba(217,176,107,0.6)" strokeWidth="2">
          {DENTES.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
        </g>
      </g>
      <g stroke="rgba(222,183,255,0.45)" strokeWidth="1" className={anim('motion-safe:animate-orbis-spin-rev')}>
        {MARCACOES.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
      </g>

      {/* tripé */}
      <g stroke="rgba(197,145,158,0.5)" strokeWidth="1.4">
        <line x1="300" y1="555" x2="215" y2="600" />
        <line x1="300" y1="555" x2="385" y2="600" />
        <line x1="300" y1="555" x2="300" y2="600" />
        <ellipse cx="300" cy="556" rx="26" ry="9" />
      </g>

      {/* luneta */}
      <g className={anim('motion-safe:animate-orbis-sweep')}>
        <line x1="300" y1="300" x2="470" y2="150" stroke="rgba(255,177,195,0.6)" strokeWidth="2" />
        <circle cx="470" cy="150" r="8" stroke="rgba(255,177,195,0.7)" strokeWidth="1.6" />
        <circle cx="470" cy="150" r="3" fill="rgba(255,177,195,0.9)" className={animada ? 'motion-safe:animate-orbis-twinkle' : undefined} />
      </g>

      {/* estrelas soltas */}
      <g fill="rgba(219,226,248,0.7)">
        {ESTRELAS.map(([cx, cy, r, atraso]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={r}
            className={animada ? 'motion-safe:animate-orbis-twinkle' : undefined}
            style={animada ? { animationDelay: atraso } : undefined}
          />
        ))}
      </g>
    </svg>
  )
}
