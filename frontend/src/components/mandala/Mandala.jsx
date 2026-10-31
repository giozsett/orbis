import { useState } from 'react'

// Força a apresentação em texto (sem emoji) dos glifos astrológicos
const TXT = '︎'

const ELEMENTOS = {
  fogo: '#ff8fa8',
  terra: '#d9b06b',
  ar: '#deb7ff',
  agua: '#9cc4ff',
}

const SIGNOS = [
  { nome: 'Áries', simbolo: '♈', elemento: 'fogo' },
  { nome: 'Touro', simbolo: '♉', elemento: 'terra' },
  { nome: 'Gêmeos', simbolo: '♊', elemento: 'ar' },
  { nome: 'Câncer', simbolo: '♋', elemento: 'agua' },
  { nome: 'Leão', simbolo: '♌', elemento: 'fogo' },
  { nome: 'Virgem', simbolo: '♍', elemento: 'terra' },
  { nome: 'Libra', simbolo: '♎', elemento: 'ar' },
  { nome: 'Escorpião', simbolo: '♏', elemento: 'agua' },
  { nome: 'Sagitário', simbolo: '♐', elemento: 'fogo' },
  { nome: 'Capricórnio', simbolo: '♑', elemento: 'terra' },
  { nome: 'Aquário', simbolo: '♒', elemento: 'ar' },
  { nome: 'Peixes', simbolo: '♓', elemento: 'agua' },
]

// Mesma paleta do PDF: tons claros o bastante para ler sobre o fundo escuro
const PLANETAS = {
  Sol: { simbolo: '☉', cor: '#ffd16a' },
  Lua: { simbolo: '☽', cor: '#d9c5ff' },
  Mercúrio: { simbolo: '☿', cor: '#9cd7ee' },
  Vênus: { simbolo: '♀', cor: '#ff9ec1' },
  Marte: { simbolo: '♂', cor: '#ff897d' },
  Júpiter: { simbolo: '♃', cor: '#c997ff' },
  Saturno: { simbolo: '♄', cor: '#d3b99d' },
  Urano: { simbolo: '♅', cor: '#87dfd8' },
  Netuno: { simbolo: '♆', cor: '#76b9ff' },
  Plutão: { simbolo: '♇', cor: '#e3a8c6' },
  'Nodo Norte': { simbolo: '☊', cor: '#f1d6aa' },
}

const ASPECT_COLORS = {
  'conjunção': '#ffd16a',
  'sextil': '#9cc4ff',
  'quadratura': '#ff4b89',
  'trígono': '#87dfd8',
  'oposição': '#ff897d',
}

const FONTE_GLIFOS = "'Noto Sans Symbols 2', 'Segoe UI Symbol', 'DejaVu Sans', sans-serif"
const FONTE_TEXTO = "'Space Grotesk', 'Inter', sans-serif"

// Geometria da roda (viewBox com margem para os rótulos dos eixos)
const C = 250
const R = 232
const RAIO = {
  zodiacoExterno: R,
  zodiacoInterno: R * 0.84,
  glifoSigno: R * 0.92,
  planetaTraco: R * 0.8,
  planetaGlifo: R * 0.725,
  planetaGrau: R * 0.625,
  casasExterno: R * 0.565,
  casasNumero: R * 0.5,
  casasInterno: R * 0.435,
}
// Separação mínima, em graus, entre glifos vizinhos no anel dos planetas
const SEPARACAO_MINIMA = 9

// Afasta glifos muito próximos mantendo a ordem zodiacal; a posição exata
// continua marcada pelo traço que liga o glifo à régua de graus.
export function espalharPosicoes(graus, minimo = SEPARACAO_MINIMA) {
  const n = graus.length
  if (n < 2 || n * minimo >= 360) return [...graus]
  const ordem = graus.map((grau, indice) => ({ indice, grau: ((grau % 360) + 360) % 360 })).sort((a, b) => a.grau - b.grau)
  const pos = ordem.map((item) => item.grau)
  for (let passada = 0; passada < 120; passada++) {
    let moveu = false
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const vao = j === 0 ? pos[0] + 360 - pos[n - 1] : pos[j] - pos[i]
      if (vao < minimo - 0.01) {
        const ajuste = (minimo - vao) / 2
        pos[i] -= ajuste
        pos[j] += ajuste
        moveu = true
      }
    }
    if (!moveu) break
  }
  const resultado = new Array(n)
  ordem.forEach((item, k) => { resultado[item.indice] = pos[k] })
  return resultado
}

function grauEMinutos(planeta) {
  const valor = Number(planeta.grau_signo ?? (planeta.grau % 30))
  const graus = Math.floor(valor)
  const minutos = Math.floor((valor - graus) * 60)
  return [`${graus}°`, `${String(minutos).padStart(2, '0')}′`]
}

// A abertura segue a coreografia da tela de login (mesma curva de easing):
// a roda entra girando, os aros são desenhados, signos, casas e planetas
// surgem em sequência e os aspectos aparecem por último.
// Tudo fica sob motion-safe: com movimento reduzido, o mapa aparece pronto.
const DESENHAR = 'motion-safe:animate-orbis-draw'
const SURGIR = 'motion-safe:animate-orbis-pop [transform-box:fill-box] origin-center'
const REVELAR = 'motion-safe:animate-orbis-fade-in'

const INICIO_SIGNOS = 700
const INICIO_CASAS = 1300
const INICIO_PLANETAS = 1700

const temHover = () => window.matchMedia?.('(hover: hover)').matches ?? true

export default function Mandala({ data, onPlanetHover, onPlanetClick, animated = true }) {
  const [planetaAtivo, setPlanetaAtivo] = useState(null)

  const anima = (classe, atraso = 0) => (animated ? { className: classe, style: { animationDelay: `${atraso}ms` } } : {})

  // Ascendente à esquerda e zodíaco no sentido anti-horário, como na roda tradicional
  const ascendente = Number(data?.ascendente?.grau ?? 0)
  const angulo = (grau) => ((180 + grau - ascendente) * Math.PI) / 180
  const ponto = (grau, raio) => ({ x: C + raio * Math.cos(angulo(grau)), y: C - raio * Math.sin(angulo(grau)) })

  const setor = (inicio, fim, externo, interno) => {
    const a = ponto(inicio, externo)
    const b = ponto(fim, externo)
    const c = ponto(fim, interno)
    const d = ponto(inicio, interno)
    return `M${a.x} ${a.y} A${externo} ${externo} 0 0 0 ${b.x} ${b.y} L${c.x} ${c.y} A${interno} ${interno} 0 0 1 ${d.x} ${d.y} Z`
  }

  const planetas = data?.planetas || []
  const posicoesExibidas = espalharPosicoes(planetas.map((planeta) => Number(planeta.grau)))
  const inicioAspectos = INICIO_PLANETAS + planetas.length * 90 + 200

  const cuspides = (data?.casas || []).slice(0, 12).map((casa) => Number(casa.grau))
  const casas = cuspides.length === 12
    ? cuspides.map((grau, i) => ({ numero: i + 1, grau, meio: grau + (((cuspides[(i + 1) % 12] - grau) % 360) + 360) % 360 / 2 }))
    : []
  const eixos = [
    { rotulo: 'ASC', grau: ascendente, ativo: Boolean(data?.ascendente) },
    { rotulo: 'DSC', grau: ascendente + 180, ativo: Boolean(data?.ascendente) },
    { rotulo: 'MC', grau: Number(data?.meio_do_ceu?.grau), ativo: Boolean(data?.meio_do_ceu) },
    { rotulo: 'IC', grau: Number(data?.meio_do_ceu?.grau) + 180, ativo: Boolean(data?.meio_do_ceu) },
  ].filter((eixo) => eixo.ativo)

  const destacar = (planeta) => {
    setPlanetaAtivo(planeta?.nome || null)
    onPlanetHover?.(planeta)
  }

  return (
    <div className="mandala-container relative">
      <svg
        className={`h-full w-full drop-shadow-[0_0_24px_rgba(255,75,137,0.12)] ${animated ? 'motion-safe:animate-orbis-sphere-in' : ''}`}
        viewBox="-24 -24 548 548"
        role="img"
        aria-label="Mandala do mapa natal"
      >
        <defs>
          <radialGradient id="mandalaMiolo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4b89" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#b86dfd" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#060e1d" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fundo da roda */}
        <circle cx={C} cy={C} r={R} fill="#060e1d" fillOpacity="0.72" />
        <circle cx={C} cy={C} r={RAIO.casasInterno} fill="url(#mandalaMiolo)" className={animated ? 'motion-safe:animate-orbis-twinkle' : undefined} />

        {/* Aro decorativo externo, o único elemento que gira */}
        <g {...anima(REVELAR, 900)}>
          <circle
            cx={C} cy={C} r={R + 9} fill="none" stroke="#d9b06b" strokeOpacity="0.28" strokeWidth="0.8" strokeDasharray="1 7"
            className={animated ? 'origin-[250px_250px] motion-safe:animate-orbis-spin-slow' : undefined}
          />
        </g>

        {/* Faixa zodiacal: setores com o tom do elemento de cada signo */}
        {SIGNOS.map((signo, index) => {
          const cor = ELEMENTOS[signo.elemento]
          const meio = ponto(index * 30 + 15, RAIO.glifoSigno)
          return (
            <g key={signo.nome} role="img" aria-label={signo.nome}>
              <title>{signo.nome}</title>
              <path d={setor(index * 30, index * 30 + 30, RAIO.zodiacoExterno, RAIO.zodiacoInterno)} fill={cor} fillOpacity={index % 2 ? 0.06 : 0.11} {...anima(REVELAR, INICIO_SIGNOS + index * 40)} />
              <g {...anima(SURGIR, INICIO_SIGNOS + index * 60)}>
                <text
                  x={meio.x} y={meio.y}
                  textAnchor="middle" dominantBaseline="central"
                  fill={cor} fontFamily={FONTE_GLIFOS} fontSize="19" fontWeight="600"
                  aria-hidden="true"
                >
                  {signo.simbolo + TXT}
                </text>
              </g>
            </g>
          )
        })}

        {/* Divisões entre signos e régua de graus na borda interna da faixa */}
        <g stroke="#dbe2f8" strokeOpacity="0.28">
          {Array.from({ length: 12 }, (_, i) => {
            const a = ponto(i * 30, RAIO.zodiacoInterno)
            const b = ponto(i * 30, RAIO.zodiacoExterno)
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth="0.8" pathLength="1" strokeDasharray="1" {...anima(DESENHAR, 500 + i * 30)} />
          })}
        </g>
        <g stroke="#dbe2f8" {...anima(REVELAR, 600)}>
          {Array.from({ length: 72 }, (_, i) => {
            const grau = i * 5
            const comprimento = i % 2 === 0 ? 7 : 4
            const a = ponto(grau, RAIO.zodiacoInterno)
            const b = ponto(grau, RAIO.zodiacoInterno - comprimento)
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth="0.6" strokeOpacity={i % 2 === 0 ? 0.4 : 0.22} />
          })}
        </g>

        {/* Aros */}
        {[RAIO.zodiacoExterno, RAIO.zodiacoInterno, RAIO.casasExterno, RAIO.casasInterno].map((raio, i) => (
          <circle key={raio} cx={C} cy={C} r={raio} fill="none" stroke="#ffb1c3" strokeOpacity={i < 2 ? 0.5 : 0.3} strokeWidth={i === 0 ? 1.2 : 0.8} pathLength="1" strokeDasharray="1" transform={`rotate(-90 ${C} ${C})`} {...anima(DESENHAR, 150 + i * 150)} />
        ))}

        {/* Cúspides das casas: discretas no anel dos planetas para não competir com eles */}
        {casas.map((casa, i) => {
          const a = ponto(casa.grau, RAIO.casasInterno)
          const b = ponto(casa.grau, RAIO.casasExterno)
          const c = ponto(casa.grau, RAIO.zodiacoInterno - 8)
          const numero = ponto(casa.meio, RAIO.casasNumero)
          return (
            <g key={casa.numero}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffb1c3" strokeOpacity="0.45" strokeWidth="0.8" pathLength="1" strokeDasharray="1" {...anima(DESENHAR, INICIO_CASAS + i * 35)} />
              <line x1={b.x} y1={b.y} x2={c.x} y2={c.y} stroke="#ffb1c3" strokeOpacity="0.14" strokeWidth="0.6" strokeDasharray="2 4" {...anima(REVELAR, INICIO_CASAS + i * 35)} />
              <g {...anima(SURGIR, INICIO_CASAS + 150 + i * 35)}>
                <title>{`Casa ${casa.numero}`}</title>
                <text x={numero.x} y={numero.y} textAnchor="middle" dominantBaseline="central" fill="#e5bcc4" fillOpacity="0.85" fontFamily={FONTE_TEXTO} fontSize="10.5" fontWeight="600">
                  {casa.numero}
                </text>
              </g>
            </g>
          )
        })}

        {/* Eixos Ascendente–Descendente e Meio do Céu–Fundo do Céu */}
        {eixos.map((eixo, i) => {
          const a = ponto(eixo.grau, RAIO.casasInterno)
          const b = ponto(eixo.grau, R + 4)
          const rotulo = ponto(eixo.grau, R + 15)
          const principal = eixo.rotulo === 'ASC' || eixo.rotulo === 'MC'
          return (
            <g key={eixo.rotulo} {...anima(REVELAR, INICIO_CASAS + i * 80)}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffb1c3" strokeOpacity={principal ? 0.85 : 0.45} strokeWidth={principal ? 1.6 : 1} />
              <text x={rotulo.x} y={rotulo.y} textAnchor="middle" dominantBaseline="central" fill={principal ? '#ffb1c3' : '#ac878f'} fontFamily={FONTE_TEXTO} fontSize="10" fontWeight="700" letterSpacing="1">
                {eixo.rotulo}
              </text>
            </g>
          )
        })}

        {/* Aspectos: ligam as posições exatas na borda do miolo, sem cruzar os glifos */}
        {data?.aspectos && (
          <g>
            {data.aspectos.map((aspecto, index) => {
              const p1 = ponto(Number(aspecto.planeta1.grau), RAIO.casasInterno)
              const p2 = ponto(Number(aspecto.planeta2.grau), RAIO.casasInterno)
              const envolveAtivo = planetaAtivo && (aspecto.planeta1.nome === planetaAtivo || aspecto.planeta2.nome === planetaAtivo)
              const tracejado = aspecto.tipo === 'quadratura' || aspecto.tipo === 'oposição'
              return (
                <g key={index} {...anima(REVELAR, inicioAspectos + index * 50)}>
                  <line
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={ASPECT_COLORS[aspecto.tipo] || '#ac878f'}
                    strokeWidth={envolveAtivo ? 1.8 : 0.9}
                    strokeDasharray={tracejado ? '4 3' : undefined}
                    opacity={planetaAtivo ? (envolveAtivo ? 0.95 : 0.12) : 0.55}
                    className="transition-all duration-300"
                  >
                    <title>{`${aspecto.planeta1.nome} ${aspecto.tipo} ${aspecto.planeta2.nome}`}</title>
                  </line>
                </g>
              )
            })}
          </g>
        )}

        {/* Planetas: traço na posição exata, glifo e grau dentro do signo */}
        {planetas.map((planeta, index) => {
          const info = PLANETAS[planeta.nome] || { simbolo: '✦', cor: '#ffb1c3' }
          const exibido = posicoesExibidas[index]
          const exato = ponto(Number(planeta.grau), RAIO.zodiacoInterno)
          const exatoInterno = ponto(Number(planeta.grau), RAIO.planetaTraco)
          const glifo = ponto(exibido, RAIO.planetaGlifo)
          const grau = ponto(exibido, RAIO.planetaGrau)
          const ativo = planetaAtivo === planeta.nome
          const atenuado = planetaAtivo && !ativo

          return (
            <g
              key={planeta.nome}
              className="cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={`${planeta.nome} em ${planeta.signo}, ${planeta.posicao}${planeta.casa ? `, casa ${planeta.casa}` : ''}`}
              onMouseEnter={() => temHover() && destacar(planeta)}
              onMouseLeave={() => temHover() && destacar(null)}
              onFocus={() => temHover() && destacar(planeta)}
              onBlur={() => destacar(null)}
              onClick={() => {
                // no toque não há hover: tocar alterna o destaque do planeta
                if (!temHover()) destacar(ativo ? null : planeta)
                onPlanetClick?.(planeta)
              }}
              opacity={atenuado ? 0.4 : 1}
              style={{ transition: 'opacity 300ms' }}
            >
              <title>{`${planeta.nome} · ${planeta.signo} ${planeta.posicao}${planeta.casa ? ` · Casa ${planeta.casa}` : ''}`}</title>
              <g {...anima(SURGIR, INICIO_PLANETAS + index * 90)}>
                <polyline
                  points={`${exato.x},${exato.y} ${exatoInterno.x},${exatoInterno.y} ${ponto(exibido, RAIO.planetaGlifo + 13).x},${ponto(exibido, RAIO.planetaGlifo + 13).y}`}
                  fill="none" stroke={info.cor} strokeOpacity="0.7" strokeWidth="0.9"
                />
                <circle cx={exato.x} cy={exato.y} r="2" fill={info.cor} />
                <circle cx={glifo.x} cy={glifo.y} r="12.5" fill="#060e1d" stroke={info.cor} strokeOpacity={ativo ? 0.95 : 0.35} strokeWidth={ativo ? 1.6 : 0.8} className="transition-all duration-300" />
                <text
                  x={glifo.x} y={glifo.y + 0.5}
                  textAnchor="middle" dominantBaseline="central"
                  fill={info.cor} fontFamily={FONTE_GLIFOS} fontSize="15.5" fontWeight="600"
                  aria-hidden="true"
                >
                  {info.simbolo + TXT}
                </text>
                {/* grau em cima, minutos (e ℞ se retrógrado) embaixo */}
                <text
                  x={grau.x} y={grau.y}
                  textAnchor="middle"
                  fill={ativo ? '#ffffff' : '#dbe2f8'} fillOpacity={ativo ? 1 : 0.85}
                  fontFamily={FONTE_TEXTO} fontWeight="600"
                  aria-hidden="true"
                >
                  <tspan x={grau.x} dy="-1" fontSize="9.5">{grauEMinutos(planeta)[0]}</tspan>
                  <tspan x={grau.x} dy="9" fontSize="7" fillOpacity="0.75">
                    {grauEMinutos(planeta)[1]}{planeta.retrogrado ? ' ℞' : ''}
                  </tspan>
                </text>
              </g>
            </g>
          )
        })}

        {/* Centro */}
        <g aria-label="Terra" role="img" {...anima(SURGIR, 300)}>
          <title>Terra</title>
          <circle cx={C} cy={C} r="7" fill="#060e1d" stroke="#ffb1c3" strokeWidth="1.2" />
          <line x1={C - 7} y1={C} x2={C + 7} y2={C} stroke="#ffb1c3" strokeWidth="0.8" />
          <line x1={C} y1={C - 7} x2={C} y2={C + 7} stroke="#ffb1c3" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  )
}
