import { useState } from 'react'

const PLANET_ICONS = {
  'Sol': 'sunny',
  'Lua': 'nightlight',
  'Mercúrio': 'auto_awesome_motion',
  'Vênus': 'favorite',
  'Marte': 'local_fire_department',
  'Júpiter': 'expand_circle_up',
  'Saturno': 'schedule',
  'Urano': 'public',
  'Netuno': 'water_drop',
  'Plutão': 'diamond',
}

const PLANET_COLORS = {
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

export default function PlanetCard({ planeta, index = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const icon = PLANET_ICONS[planeta.nome] || 'blur_on'
  const color = PLANET_COLORS[planeta.nome] || '#ffb1c3'

  return (
    <div
      className={`glass-card rounded-xl overflow-hidden transition-all duration-500 ${
        isExpanded ? 'col-span-full' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header - sempre visível */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="p-3 rounded-lg border transition-all duration-300"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}30`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{
              color,
              filter: isHovered ? `drop-shadow(0 0 10px ${color})` : 'none',
            }}
          >
            {icon}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-label text-xs text-outline uppercase">Posição</span>
          </div>
          <span className="font-label text-sm" style={{ color }}>
            {planeta.signo}, Casa {planeta.casa}
          </span>
        </div>

        <div className="text-right">
          <span className="font-label text-xs text-outline">{planeta.posicao}</span>
        </div>

        <span
          className="material-symbols-outlined text-outline transition-transform duration-300"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </div>

      {/* Conteúdo expansível */}
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isExpanded ? '500px' : '0',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sm" style={{ color }}>
              auto_awesome
            </span>
            <h4 className="font-headline text-lg" style={{ color }}>
              {planeta.nome} em {planeta.signo}
            </h4>
          </div>

          <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
            {planeta.interpretacao}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {planeta.dignidade && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-white/5">
                <span className="font-label text-xs text-outline block mb-1">DIGNIDADE</span>
                <span className="text-sm" style={{ color }}>{planeta.dignidade}</span>
              </div>
            )}
            {planeta.elemento && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-white/5">
                <span className="font-label text-xs text-outline block mb-1">ELEMENTO</span>
                <span className="text-sm" style={{ color }}>{planeta.elemento}</span>
              </div>
            )}
            {planeta.estado && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-white/5">
                <span className="font-label text-xs text-outline block mb-1">ESTADO</span>
                <span className="text-sm" style={{ color }}>{planeta.estado}</span>
              </div>
            )}
            {planeta.qualidade && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-white/5">
                <span className="font-label text-xs text-outline block mb-1">QUALIDADE</span>
                <span className="text-sm" style={{ color }}>{planeta.qualidade}</span>
              </div>
            )}
          </div>

          {planeta.aspectos && planeta.aspectos.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <span className="font-label text-xs text-outline uppercase block mb-2">Aspectos</span>
              <div className="flex flex-wrap gap-2">
                {planeta.aspectos.map((aspecto, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs border"
                    style={{
                      borderColor: `${color}30`,
                      backgroundColor: `${color}10`,
                      color,
                    }}
                  >
                    {aspecto.tipo} {aspecto.planeta}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
