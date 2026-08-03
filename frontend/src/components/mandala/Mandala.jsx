import { useEffect, useRef, useState } from 'react'

const SIGNOS = [
  { nome: 'Áries', simbolo: '\u2648\uFE0E', grau: 0, cor: '#ffb1c3' },
  { nome: 'Touro', simbolo: '\u2649\uFE0E', grau: 30, cor: '#eab9ce' },
  { nome: 'Gêmeos', simbolo: '\u264A\uFE0E', grau: 60, cor: '#deb7ff' },
  { nome: 'Câncer', simbolo: '\u264B\uFE0E', grau: 90, cor: '#ac878f' },
  { nome: 'Leão', simbolo: '\u264C\uFE0E', grau: 120, cor: '#ffb1c3' },
  { nome: 'Virgem', simbolo: '\u264D\uFE0E', grau: 150, cor: '#eab9ce' },
  { nome: 'Libra', simbolo: '\u264E\uFE0E', grau: 180, cor: '#deb7ff' },
  { nome: 'Escorpião', simbolo: '\u264F\uFE0E', grau: 210, cor: '#ac878f' },
  { nome: 'Sagitário', simbolo: '\u2650\uFE0E', grau: 240, cor: '#ffb1c3' },
  { nome: 'Capricórnio', simbolo: '\u2651\uFE0E', grau: 270, cor: '#eab9ce' },
  { nome: 'Aquário', simbolo: '\u2652\uFE0E', grau: 300, cor: '#deb7ff' },
  { nome: 'Peixes', simbolo: '\u2653\uFE0E', grau: 330, cor: '#ac878f' },
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

export default function Mandala({ data, onPlanetHover, onPlanetClick, animated = true }) {
  const [visibleLayers, setVisibleLayers] = useState(0)
  const [visibleSigns, setVisibleSigns] = useState(0)
  const [visiblePlanets, setVisiblePlanets] = useState(0)
  const svgRef = useRef(null)

  useEffect(() => {
    if (!animated) {
      setVisibleLayers(4)
      setVisibleSigns(12)
      setVisiblePlanets(10)
      return
    }

    const layerTimers = []
    for (let i = 1; i <= 4; i++) {
      layerTimers.push(setTimeout(() => setVisibleLayers(i), i * 500))
    }

    const signTimers = []
    for (let i = 1; i <= 12; i++) {
      signTimers.push(setTimeout(() => setVisibleSigns(i), 2000 + i * 150))
    }

    const planetTimers = []
    const planetCount = data?.planetas?.length || 6
    for (let i = 1; i <= planetCount; i++) {
      planetTimers.push(setTimeout(() => setVisiblePlanets(i), 4000 + i * 200))
    }

    return () => {
      layerTimers.forEach(clearTimeout)
      signTimers.forEach(clearTimeout)
      planetTimers.forEach(clearTimeout)
    }
  }, [animated, data])

  const getPlanetPosition = (grau, raio = 180) => {
    const rad = ((grau - 90) * Math.PI) / 180
    const x = 250 + raio * Math.cos(rad)
    const y = 250 + raio * Math.sin(rad)
    return { x, y }
  }

  return (
    <div className="mandala-container relative">
      <svg
        ref={svgRef}
        className="w-full h-full drop-shadow-[0_0_20px_rgba(255,177,195,0.1)]"
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
            <stop offset="0%" stopColor="#ffb1c3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffb1c3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow central */}
        <circle cx="250" cy="250" r="60" fill="url(#centerGlow)" />

        {/* Camada 1: Círculos externos */}
        <g className={visibleLayers >= 1 ? 'animate-draw-circle' : 'opacity-0'} style={{ '--path-length': '1500' }}>
          <circle
            cx="250" cy="250" r="230"
            fill="none" stroke="#ffb1c3" strokeWidth="0.5" opacity="0.3"
            strokeDasharray="1500"
            style={{ strokeDashoffset: visibleLayers >= 1 ? 0 : 1500, transition: 'stroke-dashoffset 2s ease-out' }}
          />
        </g>

        {/* Camada 2: Círculo médio */}
        <g className={visibleLayers >= 2 ? 'animate-draw-circle' : 'opacity-0'} style={{ '--path-length': '1200' }}>
          <circle
            cx="250" cy="250" r="190"
            fill="none" stroke="#ffb1c3" strokeWidth="0.3" opacity="0.5"
            strokeDasharray="1200"
            style={{ strokeDashoffset: visibleLayers >= 2 ? 0 : 1200, transition: 'stroke-dashoffset 2s ease-out' }}
          />
        </g>

        {/* Camada 3: Círculo interno tracejado */}
        <g className={visibleLayers >= 3 ? 'animate-draw-circle' : 'opacity-0'} style={{ '--path-length': '900' }}>
          <circle
            cx="250" cy="250" r="140"
            fill="none" stroke="#ffb1c3" strokeWidth="1" opacity="0.6"
            strokeDasharray="4 8"
            strokeDashoffset={visibleLayers >= 3 ? 0 : 900}
            style={{ transition: 'stroke-dashoffset 2s ease-out' }}
          />
        </g>

        {/* Camada 4: Divisões de casa */}
        <g style={{ opacity: visibleLayers >= 4 ? 1 : 0, transition: 'opacity 1s ease-out' }}>
          {[0, 30, 60, 90, 120, 150].map((angulo) => {
            const rad = ((angulo - 90) * Math.PI) / 180
            const x1 = 250 + 100 * Math.cos(rad)
            const y1 = 250 + 100 * Math.sin(rad)
            const x2 = 250 + 230 * Math.cos(rad)
            const y2 = 250 + 230 * Math.sin(rad)
            return (
              <line
                key={angulo}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#5c3f45" strokeWidth="0.5"
                strokeDasharray="500"
                strokeDashoffset={visibleLayers >= 4 ? 0 : 500}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            )
          })}
        </g>

        {/* Signos do zodíaco */}
        {SIGNOS.map((signo, index) => {
          const pos = getPlanetPosition(signo.grau, 210)
          const isVisible = visibleSigns > index
          return (
            <g
              key={signo.nome}
              role="img"
              aria-label={signo.nome}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: `${pos.x}px ${pos.y}px`,
                transition: 'all 0.4s ease-out',
              }}
            >
              <title>{signo.nome}</title>
              <circle
                cx={pos.x} cy={pos.y} r="16"
                fill="#18202f"
                fillOpacity="0.96"
                stroke={signo.cor} strokeWidth="1.25"
              />
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

        {/* Núcleo central */}
        <circle cx="250" cy="250" r="20" fill="#0b1323" stroke="#ffb1c3" strokeWidth="2" />
        <text x="250" y="255" textAnchor="middle" fill="#ffb1c3" fontFamily="Inter" fontSize="10" fontWeight="bold">
          EARTH
        </text>

        {/* Linhas de aspecto: ficam abaixo dos planetas e de seus rótulos */}
        {data?.aspectos && visiblePlanets > 3 && (
          <g style={{ opacity: visiblePlanets > 3 ? 0.6 : 0, transition: 'opacity 1s ease-out' }}>
            {data.aspectos.map((aspecto, index) => {
              const p1 = getPlanetPosition(aspecto.planeta1.grau, 160)
              const p2 = getPlanetPosition(aspecto.planeta2.grau, 160)
              const colors = {
                'conjunção': '#ffb1c3',
                'sextil': '#deb7ff',
                'quadratura': '#ffb4ab',
                'trígono': '#eab9ce',
                'oposição': '#ff4b89',
              }
              return (
                <line
                  key={index}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={colors[aspecto.tipo] || '#5c3f45'}
                  strokeWidth="1"
                  strokeDasharray={aspecto.tipo === 'quadratura' || aspecto.tipo === 'oposição' ? '4 2' : 'none'}
                />
              )
            })}
          </g>
        )}

        {/* Planetas */}
        {data?.planetas?.slice(0, visiblePlanets).map((planeta, index) => {
          const pos = getPlanetPosition(planeta.grau, 160)
          const labelPos = getPlanetPosition(planeta.grau, 181)
          const labelWidth = Math.max(38, planeta.nome.length * 6.4 + 14)
          const color = PLANET_COLORS[planeta.nome] || '#ffb1c3'

          return (
            <g
              key={planeta.nome}
              className="cursor-pointer"
              onMouseEnter={() => onPlanetHover?.(planeta)}
              onMouseLeave={() => onPlanetHover?.(null)}
              onClick={() => onPlanetClick?.(planeta)}
              style={{
                opacity: visiblePlanets > index ? 1 : 0,
                transform: visiblePlanets > index ? 'scale(1)' : 'scale(0)',
                transformOrigin: `${pos.x}px ${pos.y}px`,
                transition: 'all 0.5s ease-out',
              }}
            >
              <line
                x1={pos.x} y1={pos.y}
                x2={labelPos.x} y2={labelPos.y}
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.7"
              />
              <circle
                cx={pos.x} cy={pos.y} r="8.5"
                fill={color}
                filter="url(#glow)"
                className="animate-planet-pulse"
                style={{ '--planet-color': color }}
              />
              <rect
                x={labelPos.x - labelWidth / 2}
                y={labelPos.y - 9}
                width={labelWidth}
                height="18"
                rx="9"
                fill="#0b1323"
                fillOpacity="0.94"
                stroke={color}
                strokeWidth="0.75"
                strokeOpacity="0.75"
              />
              <text
                x={labelPos.x} y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#dbe2f8"
                fontSize="10.5"
                fontFamily="'Space Grotesk', 'Inter', sans-serif"
                fontWeight="650"
                letterSpacing="0.15"
              >
                {planeta.nome}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Anel de rotação externo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full border border-dashed border-outline-variant rounded-full animate-rotate-slow opacity-20" />
      </div>
    </div>
  )
}
