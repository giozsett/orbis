import { useState } from 'react'

const SIGNOS = [
  { nome: 'Áries', simbolo: '♈︎', grau: 0, cor: '#ffb1c3' },
  { nome: 'Touro', simbolo: '♉︎', grau: 30, cor: '#eab9ce' },
  { nome: 'Gêmeos', simbolo: '♊︎', grau: 60, cor: '#deb7ff' },
  { nome: 'Câncer', simbolo: '♋︎', grau: 90, cor: '#ac878f' },
  { nome: 'Leão', simbolo: '♌︎', grau: 120, cor: '#ffb1c3' },
  { nome: 'Virgem', simbolo: '♍︎', grau: 150, cor: '#eab9ce' },
  { nome: 'Libra', simbolo: '♎︎', grau: 180, cor: '#deb7ff' },
  { nome: 'Escorpião', simbolo: '♏︎', grau: 210, cor: '#ac878f' },
  { nome: 'Sagitário', simbolo: '♐︎', grau: 240, cor: '#ffb1c3' },
  { nome: 'Capricórnio', simbolo: '♑︎', grau: 270, cor: '#eab9ce' },
  { nome: 'Aquário', simbolo: '♒︎', grau: 300, cor: '#deb7ff' },
  { nome: 'Peixes', simbolo: '♓︎', grau: 330, cor: '#ac878f' },
]

const PLANET_COLORS = {
  Sol: '#ffb1c3',
  Lua: '#eab9ce',
  Mercúrio: '#deb7ff',
  Vênus: '#ff4b89',
  Marte: '#ffb4ab',
  Júpiter: '#b86dfd',
  Saturno: '#ac878f',
  Urano: '#5c3f45',
  Netuno: '#633e4f',
  Plutão: '#93000a',
}

const ASPECT_COLORS = {
  'conjunção': '#ffb1c3',
  'sextil': '#deb7ff',
  'quadratura': '#ffb4ab',
  'trígono': '#eab9ce',
  'oposição': '#ff4b89',
}

const getPlanetPosition = (grau, raio = 180) => {
  const rad = ((grau - 90) * Math.PI) / 180
  return { x: 250 + raio * Math.cos(rad), y: 250 + raio * Math.sin(rad) }
}

// Régua de graus do aro externo, no mesmo estilo das marcações da esfera armilar
const MARCACOES = Array.from({ length: 72 }, (_, i) => {
  const grau = i * 5
  const p1 = getPlanetPosition(grau, 234)
  const p2 = getPlanetPosition(grau, i % 6 === 0 ? 244 : 239)
  return [p1.x, p1.y, p2.x, p2.y]
})

const ESTRELAS = [
  [34, 52, 1.6, '0s'],
  [470, 38, 1.2, '1.1s'],
  [462, 468, 1.6, '0.6s'],
  [28, 440, 1.2, '1.9s'],
]

// A abertura segue a coreografia da tela de login (mesma curva de easing):
// a mandala entra girando, os aros são desenhados, as casas se abrem, os signos
// e os planetas surgem em sequência e os aspectos são traçados por último.
// Os traços usam pathLength=1, então o desenho funciona para qualquer raio.
// Tudo fica sob motion-safe: com movimento reduzido, o mapa aparece pronto.
const DESENHAR = 'motion-safe:animate-orbis-draw'
const SURGIR = 'motion-safe:animate-orbis-pop [transform-box:fill-box] origin-center'
const REVELAR = 'motion-safe:animate-orbis-fade-in'
const PIVO = 'origin-[250px_250px]'

const INICIO_SIGNOS = 1100
const INICIO_PLANETAS = 1900

export default function Mandala({ data, onPlanetHover, onPlanetClick, animated = true }) {
  const [planetaAtivo, setPlanetaAtivo] = useState(null)

  // Sem `animated`, nenhuma classe/atraso é aplicado e o mapa já nasce completo
  const anima = (classe, atraso = 0) => (animated ? { className: classe, style: { animationDelay: `${atraso}ms` } } : {})
  const gira = (classe) => (animated ? `${PIVO} ${classe}` : undefined)

  const planetas = data?.planetas || []
  const inicioAspectos = INICIO_PLANETAS + planetas.length * 110 + 200

  const destacar = (planeta) => {
    setPlanetaAtivo(planeta?.nome || null)
    onPlanetHover?.(planeta)
  }

  return (
    <div className="mandala-container relative">
      <svg
        className={`h-full w-full drop-shadow-[0_0_24px_rgba(255,75,137,0.12)] ${animated ? 'motion-safe:animate-orbis-sphere-in' : ''}`}
        viewBox="0 0 500 500"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4b89" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#b86dfd" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#b86dfd" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow central que "respira" */}
        <circle cx="250" cy="250" r="90" fill="url(#centerGlow)" className={animated ? 'motion-safe:animate-orbis-twinkle' : undefined} />

        {/* Estrelas soltas */}
        <g fill="rgba(219,226,248,0.7)">
          {ESTRELAS.map(([cx, cy, r, atraso]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} className={animated ? 'motion-safe:animate-orbis-twinkle' : undefined} style={animated ? { animationDelay: atraso } : undefined} />
          ))}
        </g>

        {/* Régua de graus girando devagar, como o aro dentado da esfera */}
        <g {...anima(REVELAR, 700)}>
          <g stroke="rgba(217,176,107,0.45)" strokeWidth="1" className={gira('motion-safe:animate-orbis-spin-slow')}>
            {MARCACOES.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
          </g>
        </g>

        {/* Aros desenhados em sequência */}
        <circle cx="250" cy="250" r="230" fill="none" stroke="#ffb1c3" strokeWidth="0.8" opacity="0.4" pathLength="1" strokeDasharray="1" transform="rotate(-90 250 250)" {...anima(DESENHAR, 200)} />
        <circle cx="250" cy="250" r="190" fill="none" stroke="#deb7ff" strokeWidth="0.6" opacity="0.5" pathLength="1" strokeDasharray="1" transform="rotate(-90 250 250)" {...anima(DESENHAR, 400)} />
        <g {...anima(REVELAR, 600)}>
          <circle cx="250" cy="250" r="140" fill="none" stroke="#ffb1c3" strokeWidth="1" opacity="0.6" strokeDasharray="4 8" className={gira('motion-safe:animate-orbis-spin-rev')} />
        </g>

        {/* Divisões de casa abrindo a partir do centro */}
        <g stroke="#5c3f45" strokeWidth="0.6">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angulo, i) => {
            const p1 = getPlanetPosition(angulo, 100)
            const p2 = getPlanetPosition(angulo, 230)
            return <line key={angulo} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} pathLength="1" strokeDasharray="1" {...anima(DESENHAR, 850 + i * 40)} />
          })}
        </g>

        {/* Signos do zodíaco */}
        {SIGNOS.map((signo, index) => {
          const pos = getPlanetPosition(signo.grau + 15, 210)
          return (
            <g key={signo.nome} role="img" aria-label={signo.nome} {...anima(SURGIR, INICIO_SIGNOS + index * 70)}>
              <title>{signo.nome}</title>
              <circle cx={pos.x} cy={pos.y} r="16" fill="#060e1d" fillOpacity="0.96" stroke={signo.cor} strokeWidth="1.25" />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={signo.cor}
                fontFamily="'Noto Sans Symbols 2', 'Segoe UI Symbol', 'DejaVu Sans', sans-serif"
                fontSize="18"
                fontWeight="600"
                aria-hidden="true"
              >
                {signo.simbolo}
              </text>
            </g>
          )
        })}

        {/* Linhas de aspecto: traçadas depois dos planetas, abaixo deles e de seus rótulos */}
        {data?.aspectos && (
          <g opacity="0.6">
            {data.aspectos.map((aspecto, index) => {
              const p1 = getPlanetPosition(aspecto.planeta1.grau, 160)
              const p2 = getPlanetPosition(aspecto.planeta2.grau, 160)
              const envolveAtivo = planetaAtivo && (aspecto.planeta1.nome === planetaAtivo || aspecto.planeta2.nome === planetaAtivo)
              const tracejado = aspecto.tipo === 'quadratura' || aspecto.tipo === 'oposição'
              return (
                <g key={index} {...anima(REVELAR, inicioAspectos + index * 60)}>
                  <line
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={ASPECT_COLORS[aspecto.tipo] || '#5c3f45'}
                    strokeWidth={envolveAtivo ? 1.8 : 1}
                    strokeDasharray={tracejado ? '4 2' : undefined}
                    opacity={planetaAtivo && !envolveAtivo ? 0.25 : 1}
                    className="transition-all duration-300"
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* O núcleo fica acima das linhas para preservar a legibilidade no centro. */}
        <g aria-label="Terra" role="img" {...anima(SURGIR, 300)}>
          <title>Terra</title>
          <circle cx="250" cy="250" r="22" fill="#0b1323" stroke="#ffb1c3" strokeWidth="2" />
          <circle cx="250" cy="250" r="17" fill="#131c2b" stroke="#ffb1c3" strokeOpacity="0.25" strokeWidth="0.75" />
          <text x="250" y="254" textAnchor="middle" fill="#ffb1c3" fontFamily="Inter" fontSize="9" fontWeight="bold" letterSpacing="0.5">
            TERRA
          </text>
        </g>

        {/* Planetas */}
        {planetas.map((planeta, index) => {
          const pos = getPlanetPosition(planeta.grau, 160)
          const labelPos = getPlanetPosition(planeta.grau, 181)
          const labelWidth = Math.max(38, planeta.nome.length * 6.4 + 14)
          const color = PLANET_COLORS[planeta.nome] || '#ffb1c3'
          const ativo = planetaAtivo === planeta.nome

          return (
            <g
              key={planeta.nome}
              className="cursor-pointer"
              onMouseEnter={() => destacar(planeta)}
              onMouseLeave={() => destacar(null)}
              onClick={() => onPlanetClick?.(planeta)}
            >
              <g {...anima(SURGIR, INICIO_PLANETAS + index * 110)}>
                {/* halo de destaque no hover */}
                <circle cx={pos.x} cy={pos.y} r="15" fill="none" stroke={color} strokeWidth="1" opacity={ativo ? 0.7 : 0} className="transition-opacity duration-300" />
                <line x1={pos.x} y1={pos.y} x2={labelPos.x} y2={labelPos.y} stroke={color} strokeWidth="1" strokeOpacity="0.7" />
                <circle
                  cx={pos.x} cy={pos.y} r="8.5"
                  fill={color}
                  filter="url(#glow)"
                  className="animate-planet-pulse [transform-box:fill-box] origin-center"
                  style={{ '--planet-color': color }}
                />
                <rect
                  x={labelPos.x - labelWidth / 2}
                  y={labelPos.y - 9}
                  width={labelWidth}
                  height="18"
                  rx="9"
                  fill="#060e1d"
                  fillOpacity="0.94"
                  stroke={color}
                  strokeWidth={ativo ? 1.4 : 0.75}
                  strokeOpacity="0.75"
                  className="transition-all duration-300"
                />
                <text
                  x={labelPos.x} y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={ativo ? '#ffffff' : '#dbe2f8'}
                  fontSize="10.5"
                  fontFamily="'Space Grotesk', 'Inter', sans-serif"
                  fontWeight="650"
                  letterSpacing="0.15"
                >
                  {planeta.nome}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
