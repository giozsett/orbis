import { useEffect, useRef, useState } from 'react'

const SIGNOS = [
  { nome: 'Áries', simbolo: '♈', grau: 0 },
  { nome: 'Touro', simbolo: '♉', grau: 30 },
  { nome: 'Gêmeos', simbolo: '♊', grau: 60 },
  { nome: 'Câncer', simbolo: '♋', grau: 90 },
  { nome: 'Leão', simbolo: '♌', grau: 120 },
  { nome: 'Virgem', simbolo: '♍', grau: 150 },
  { nome: 'Libra', simbolo: '♎', grau: 180 },
  { nome: 'Escorpião', simbolo: '♏', grau: 210 },
  { nome: 'Sagitário', simbolo: '♐', grau: 240 },
  { nome: 'Capricórnio', simbolo: '♑', grau: 270 },
  { nome: 'Aquário', simbolo: '♒', grau: 300 },
  { nome: 'Peixes', simbolo: '♓', grau: 330 },
]

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
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: `${pos.x}px ${pos.y}px`,
                transition: 'all 0.4s ease-out',
              }}
            >
              <circle
                cx={pos.x} cy={pos.y} r="12"
                fill="rgba(11, 19, 35, 0.8)"
                stroke="#ffb1c3" strokeWidth="0.5"
              />
              <text
                x={pos.x} y={pos.y + 4}
                textAnchor="middle"
                fill="#e5bcc4"
                fontSize="10"
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

        {/* Planetas */}
        {data?.planetas?.slice(0, visiblePlanets).map((planeta, index) => {
          const pos = getPlanetPosition(planeta.grau, 160)
          const colors = {
            'Sol': '#ffb1c3',
            'Lua': '#eab9ce',
            'Mercúrio': '#deb7ff',
            'Vênus': '#ff4b89',
            'Marte': '#ffb4ab',
            'Júpiter': '#b86dfd',
            'Saturno': '#ac878f',
            'Urano': '#5c3f45',
            'Netuno': '#633e4f',
            'Plutão': '#93000a',
          }
          const color = colors[planeta.nome] || '#ffb1c3'

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
              <circle
                cx={pos.x} cy={pos.y} r="8"
                fill={color}
                filter="url(#glow)"
                className="animate-planet-pulse"
                style={{ '--planet-color': color }}
              />
              <text
                x={pos.x} y={pos.y - 12}
                textAnchor="middle"
                fill={color}
                fontSize="8"
                fontFamily="JetBrains Mono"
              >
                {planeta.nome}
              </text>
            </g>
          )
        })}

        {/* Linhas de aspecto */}
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
      </svg>

      {/* Anel de rotação externo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full border border-dashed border-outline-variant rounded-full animate-rotate-slow opacity-20" />
      </div>
    </div>
  )
}
