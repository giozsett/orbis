import { useState } from 'react'
import { corTema } from '../../utils/tema'

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
  'Sol': '#ffd16a',
  'Lua': '#d9c5ff',
  'Mercúrio': '#c3a6ff',
  'Vênus': '#ff4b89',
  'Marte': '#ffb4ab',
  'Júpiter': '#9a6dfd',
  'Saturno': '#8a93ba',
  'Urano': '#87dfd8',
  'Netuno': '#76b9ff',
  'Plutão': '#e3a8c6',
}

export default function PlanetCard({ planeta, index = 0, atraso = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const icon = PLANET_ICONS[planeta.nome] || 'blur_on'
  const color = corTema(PLANET_COLORS[planeta.nome] || '#a9b8ff')
  const interpretacaoBase = planeta.interpretacao_base || {}
  const secoesInterpretacao = [
    {
      titulo: 'Planeta',
      icone: 'orbit',
      texto: interpretacaoBase.planeta || planeta.interpretacao || `${planeta.nome} representa uma função importante da personalidade.`,
    },
    {
      titulo: 'Signo',
      icone: 'brightness_7',
      texto: interpretacaoBase.signo || `${planeta.nome} está em ${planeta.signo}, indicando como essa energia tende a ser expressa.`,
    },
    {
      titulo: 'Casa',
      icone: 'home_work',
      texto: interpretacaoBase.casa || `Na Casa ${planeta.casa}, essa energia ganha destaque em uma área específica da vida.`,
    },
  ]
  const contentId = `planet-card-content-${index}`

  const toggleExpanded = () => setIsExpanded(expanded => !expanded)

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 motion-safe:animate-orbis-rise ${
        isExpanded ? 'col-span-full border-primary/30' : ''
      }`}
      style={{ animationDelay: `${atraso + index * 80}ms` }}
    >
      {/* Header - sempre visível */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-veu/5 transition-all duration-300"
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleExpanded()
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex="0"
        aria-expanded={isExpanded}
        aria-controls={contentId}
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
            <span className="font-label text-xs text-outline uppercase">{planeta.nome}</span>
          </div>
          <span className="font-label text-sm" style={{ color }}>
            {planeta.signo}, Casa {planeta.casa}
          </span>
        </div>

        <div className="text-right">
          <span className="font-dados text-xs text-outline">{planeta.posicao}</span>
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
        id={contentId}
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isExpanded ? '500px' : '0',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 pt-2 border-t border-veu/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sm" style={{ color }}>
              auto_awesome
            </span>
            <h4 className="font-headline text-lg" style={{ color }}>
              {planeta.nome} em {planeta.signo}
            </h4>
          </div>

          <div className="space-y-3 mb-4">
            {secoesInterpretacao.map(secao => (
              <div
                key={secao.titulo}
                className="rounded-lg border border-veu/5 bg-surface-container-low/55 p-3 transition-colors hover:border-veu/10"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color }}>{secao.icone}</span>
                  <span className="font-label text-[10px] uppercase tracking-[0.16em] text-outline">{secao.titulo}</span>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">{secao.texto}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {planeta.dignidade && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-veu/5">
                <span className="font-label text-xs text-outline block mb-1">DIGNIDADE</span>
                <span className="text-sm" style={{ color }}>{planeta.dignidade}</span>
              </div>
            )}
            {planeta.elemento && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-veu/5">
                <span className="font-label text-xs text-outline block mb-1">ELEMENTO</span>
                <span className="text-sm" style={{ color }}>{planeta.elemento}</span>
              </div>
            )}
            {planeta.estado && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-veu/5">
                <span className="font-label text-xs text-outline block mb-1">ESTADO</span>
                <span className="text-sm" style={{ color }}>{planeta.estado}</span>
              </div>
            )}
            {planeta.qualidade && (
              <div className="p-3 rounded bg-surface-container-highest/40 border border-veu/5">
                <span className="font-label text-xs text-outline block mb-1">QUALIDADE</span>
                <span className="text-sm" style={{ color }}>{planeta.qualidade}</span>
              </div>
            )}
          </div>

          {planeta.aspectos && planeta.aspectos.length > 0 && (
            <div className="mt-4 pt-3 border-t border-veu/5">
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
