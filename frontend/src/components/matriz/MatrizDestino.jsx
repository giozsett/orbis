import { useState } from 'react'
import { corTema } from '../../utils/tema'

const FONTE_TEXTO = "'Instrument Sans', system-ui, sans-serif"
// numerais dos pontos principais na mesma serifa dos títulos
const FONTE_NUMERAL = "'Marcellus', Georgia, serif"

// Geometria do octagrama (viewBox com margem para a linha das idades)
const C = 250
const R = 182
const RAIO_IDADES = R + 32
const RAIO_ROTULO_IDADE = R + 56

// Ângulo de cada vértice (graus, sentido anti-horário a partir da direita).
// A linha do tempo corre no sentido horário a partir da esquerda (0 anos).
const ANGULOS = { A: 180, F: 135, B: 90, G: 45, C: 0, H: -45, D: -90, I: -135 }
const RETOS = ['A', 'B', 'C', 'D']
const DIAGONAIS = ['F', 'G', 'H', 'I']

// Cores dos chakras nos raios de personalidade (A), talento (B) e matéria (C, D)
const CORES = {
  A: '#c9a7ff', B: '#c9a7ff', A1: '#9c8cff', B1: '#9c8cff', A2: '#87b8ff', B2: '#87b8ff',
  A3: '#87dfb0', B3: '#87dfb0', E: '#ffd16a', C2: '#ffad6a', D2: '#ffad6a',
  C1: '#ff8a74', D1: '#ff8a74', C: '#ff6a7d', D: '#ff6a7d',
  X: '#a9b8ff', dinheiro: '#f2c7a5', amor: '#ff897d',
}
const COR_DIAGONAL = '#b4bcdf'

const NOMES = {
  A: 'Personalidade', B: 'Talento', C: 'Dinheiro e matéria', D: 'Cauda cármica',
  F: 'Linha paterna (céu)', G: 'Linha materna (céu)', H: 'Linha paterna (terra)', I: 'Linha materna (terra)',
}

export function rotuloPonto(id) {
  if (id === 'E') return 'Zona de conforto'
  if (id === 'X') return 'Equilíbrio entre amor e dinheiro'
  if (id === 'dinheiro') return 'Canal do dinheiro'
  if (id === 'amor') return 'Canal do amor'
  if (id === 'A3' || id === 'B3') return `Coração · ${NOMES[id[0]].toLowerCase()}`
  if (id === 'C2') return 'Entrada do dinheiro'
  if (id === 'D2') return 'Entrada do amor'
  if (id.length === 2) return `${NOMES[id[0]]} · ${id[1] === '1' ? 'exterior' : 'interior'}`
  return NOMES[id]
}

const corPonto = (id) => corTema(CORES[id] || (DIAGONAIS.includes(id[0]) ? COR_DIAGONAL : '#a9b8ff'))

function posicao(angulo, raio) {
  const rad = (angulo * Math.PI) / 180
  return { x: C + raio * Math.cos(rad), y: C - raio * Math.sin(rad) }
}

// Pontos desenhados: [id, posição, raio do círculo]
function montarPontos() {
  const pontos = []
  for (const v of [...RETOS, ...DIAGONAIS]) {
    const reto = RETOS.includes(v)
    pontos.push([v, posicao(ANGULOS[v], R), reto ? 21 : 18])
    pontos.push([`${v}1`, posicao(ANGULOS[v], R * 0.79), 13])
    pontos.push([`${v}2`, posicao(ANGULOS[v], R * 0.6), 13])
  }
  pontos.push(['A3', posicao(ANGULOS.A, R * 0.41), 12])
  pontos.push(['B3', posicao(ANGULOS.B, R * 0.41), 12])
  const c2 = posicao(ANGULOS.C, R * 0.6)
  const d2 = posicao(ANGULOS.D, R * 0.6)
  const x = { x: (c2.x + d2.x) / 2, y: (c2.y + d2.y) / 2 }
  pontos.push(['X', x, 11])
  pontos.push(['dinheiro', { x: (x.x + c2.x) / 2, y: (x.y + c2.y) / 2 }, 11])
  pontos.push(['amor', { x: (x.x + d2.x) / 2, y: (x.y + d2.y) / 2 }, 11])
  pontos.push(['E', { x: C, y: C }, 27])
  return pontos
}

const PONTOS = montarPontos()
const ORDEM_SURGIR = Object.fromEntries(PONTOS.map(([id], i) => [id, i]))

const DESENHAR = 'motion-safe:animate-orbis-draw'
const SURGIR = 'motion-safe:animate-orbis-pop [transform-box:fill-box] origin-center'
const REVELAR = 'motion-safe:animate-orbis-fade-in'

const INICIO_PONTOS = 900
const INICIO_IDADES = 1900

const temHover = () => window.matchMedia?.('(hover: hover)').matches ?? true

const formatarIdade = (idade) => (Number.isInteger(idade) ? String(idade) : idade.toFixed(1).replace('.', ','))

export default function MatrizDestino({ matriz, catalogo = {}, selecionado, onPontoHover, onPontoClick, animated = true }) {
  const [ativo, setAtivo] = useState(null)
  const anima = (classe, atraso = 0) => (animated ? { className: classe, style: { animationDelay: `${atraso}ms` } } : {})
  const valores = matriz?.pontos || {}
  const destaque = ativo || selecionado

  const destacar = (id) => {
    setAtivo(id)
    onPontoHover?.(id)
  }

  const poligono = (ids) => ids.map((v) => { const p = posicao(ANGULOS[v], R); return `${p.x},${p.y}` }).join(' ')
  const c2 = posicao(ANGULOS.C, R * 0.6)
  const d2 = posicao(ANGULOS.D, R * 0.6)

  return (
    <svg
      className={`h-full w-full drop-shadow-[0_0_24px_rgb(var(--c-secondary)/0.12)] ${animated ? 'motion-safe:animate-orbis-sphere-in' : ''}`}
      viewBox="-24 -24 548 548"
      role="img"
      aria-label="Matriz do destino"
    >
      <defs>
        <radialGradient id="matrizMiolo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd16a" stopOpacity="0.16" />
          <stop offset="60%" stopColor="rgb(var(--c-tertiary-container))" stopOpacity="0.06" />
          <stop offset="100%" stopColor="rgb(var(--c-surface-container-lowest))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fundo e aros */}
      <circle cx={C} cy={C} r={RAIO_IDADES + 14} fill="rgb(var(--c-surface-container-lowest))" fillOpacity="0.72" />
      <circle cx={C} cy={C} r={R * 0.75} fill="url(#matrizMiolo)" className={animated ? 'motion-safe:animate-orbis-twinkle' : undefined} />
      <g {...anima(REVELAR, 700)}>
        <circle
          cx={C} cy={C} r={RAIO_IDADES + 14} fill="none" stroke="rgb(var(--c-brass))" strokeOpacity="0.28" strokeWidth="0.8" strokeDasharray="1 7"
          className={animated ? 'origin-[250px_250px] motion-safe:animate-orbis-spin-slow' : undefined}
        />
      </g>
      <circle cx={C} cy={C} r={RAIO_IDADES} fill="none" stroke="rgb(var(--c-primary))" strokeOpacity="0.22" strokeWidth="0.8" pathLength="1" strokeDasharray="1" transform={`rotate(-90 ${C} ${C})`} {...anima(DESENHAR, 150)} />

      {/* Octagrama: quadrado pessoal (losango) e quadrado ancestral */}
      <polygon points={poligono(RETOS)} fill="none" stroke="rgb(var(--c-primary))" strokeOpacity="0.55" strokeWidth="1.2" pathLength="1" strokeDasharray="1" {...anima(DESENHAR, 300)} />
      <polygon points={poligono(DIAGONAIS)} fill="none" stroke={COR_DIAGONAL} strokeOpacity="0.4" strokeWidth="1" pathLength="1" strokeDasharray="1" {...anima(DESENHAR, 450)} />

      {/* Raios até o centro */}
      <g stroke="rgb(var(--c-on-surface))" strokeOpacity="0.2" strokeWidth="0.8">
        {[...RETOS, ...DIAGONAIS].map((v, i) => {
          const p = posicao(ANGULOS[v], R)
          return <line key={v} x1={p.x} y1={p.y} x2={C} y2={C} pathLength="1" strokeDasharray="1" {...anima(DESENHAR, 600 + i * 40)} />
        })}
      </g>

      {/* Canal amor–dinheiro */}
      <line x1={c2.x} y1={c2.y} x2={d2.x} y2={d2.y} stroke="#ff897d" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="4 3" {...anima(REVELAR, 800)} />

      {/* Linha do tempo: 0 a 80 anos no sentido horário a partir da esquerda */}
      <g {...anima(REVELAR, INICIO_IDADES)}>
        {(matriz?.idades || []).map((item) => {
          const angulo = ANGULOS.A - item.idade * 4.5
          const p = posicao(angulo, RAIO_IDADES)
          if (item.vertice) {
            const rotulo = posicao(angulo, RAIO_ROTULO_IDADE)
            return (
              <g key={item.idade}>
                <line x1={posicao(angulo, R + 22).x} y1={posicao(angulo, R + 22).y} x2={posicao(angulo, RAIO_IDADES + 12).x} y2={posicao(angulo, RAIO_IDADES + 12).y} stroke="rgb(var(--c-primary))" strokeOpacity="0.5" strokeWidth="0.8" />
                <text x={rotulo.x} y={rotulo.y} textAnchor="middle" dominantBaseline="central" fill="rgb(var(--c-primary))" fontFamily={FONTE_TEXTO} fontSize="10" fontWeight="700" letterSpacing="0.5">
                  {item.idade} anos
                </text>
              </g>
            )
          }
          return (
            <g key={item.idade}>
              <title>{`${formatarIdade(item.idade)} anos · ${catalogo[item.arcano]?.nome || `Arcano ${item.arcano}`}`}</title>
              <circle cx={p.x} cy={p.y} r="8" fill="rgb(var(--c-surface-container-lowest))" stroke="rgb(var(--c-on-surface))" strokeOpacity="0.25" strokeWidth="0.6" />
              <text x={p.x} y={p.y + 0.5} textAnchor="middle" dominantBaseline="central" fill="rgb(var(--c-on-surface))" fillOpacity="0.8" fontFamily={FONTE_TEXTO} fontSize="8" fontWeight="600">
                {item.arcano}
              </text>
            </g>
          )
        })}
      </g>

      {/* Pontos da matriz */}
      {PONTOS.map(([id, p, raio]) => {
        const valor = valores[id]
        if (valor == null) return null
        const cor = corPonto(id)
        const ehAtivo = destaque === id
        const atenuado = destaque && !ehAtivo
        const nome = catalogo[valor]?.nome
        return (
          <g
            key={id}
            className="cursor-pointer"
            tabIndex={0}
            role="button"
            aria-label={`${rotuloPonto(id)}: arcano ${valor}${nome ? `, ${nome}` : ''}`}
            onMouseEnter={() => temHover() && destacar(id)}
            onMouseLeave={() => temHover() && destacar(null)}
            onFocus={() => temHover() && destacar(id)}
            onBlur={() => destacar(null)}
            onClick={() => onPontoClick?.(id)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault()
                onPontoClick?.(id)
              }
            }}
            opacity={atenuado ? 0.55 : 1}
            style={{ transition: 'opacity 300ms' }}
          >
            <title>{`${rotuloPonto(id)} · ${valor}${nome ? ` · ${nome}` : ''}`}</title>
            <g {...anima(SURGIR, INICIO_PONTOS + ORDEM_SURGIR[id] * 25)}>
              <circle
                cx={p.x} cy={p.y} r={raio}
                fill="rgb(var(--c-surface-container-lowest))" stroke={cor}
                strokeOpacity={ehAtivo ? 1 : 0.7} strokeWidth={ehAtivo ? 2.2 : 1.2}
                className="transition-all duration-300"
              />
              {id === 'E' && <circle cx={p.x} cy={p.y} r={raio - 5} fill="none" stroke={cor} strokeOpacity="0.3" strokeWidth="0.8" />}
              <text
                x={p.x} y={p.y + 0.5}
                textAnchor="middle" dominantBaseline="central"
                fill={ehAtivo ? 'rgb(var(--c-on-surface))' : cor}
                fontFamily={raio >= 18 ? FONTE_NUMERAL : FONTE_TEXTO} fontSize={raio >= 18 ? 17 : raio >= 13 ? 11 : 9.5} fontWeight={raio >= 18 ? 500 : 600}
                aria-hidden="true"
              >
                {valor}
              </text>
            </g>
          </g>
        )
      })}

      {/* Ícones dos canais */}
      <g fontFamily={FONTE_TEXTO} fontSize="9" fontWeight="700" letterSpacing="1" {...anima(REVELAR, INICIO_PONTOS + 800)} aria-hidden="true">
        <text x={c2.x + 4} y={c2.y + 30} fill={CORES.dinheiro} fillOpacity="0.8">$</text>
        <text x={d2.x - 30} y={d2.y - 2} fill={CORES.amor} fillOpacity="0.8">♥</text>
      </g>
    </svg>
  )
}
