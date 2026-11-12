import { useSyncExternalStore } from 'react'

// Tema do app: 'dark' (céu noturno) ou 'light' (nascer do sol).
// Fica em <html data-theme>; as cores em si estão em styles/tema.css.
const CHAVE = 'orbis:tema'
const EVENTO = 'orbis:tema-alterado'
const COR_BARRA = { dark: '#070b1d', light: '#fdf3ee' }

export function temaAtual() {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function temaInicial() {
  try {
    const salvo = window.localStorage.getItem(CHAVE)
    if (salvo === 'light' || salvo === 'dark') return salvo
  } catch { /* armazenamento bloqueado: segue a preferência do sistema */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function aplicarTema(tema, { animar = false } = {}) {
  const raiz = document.documentElement
  if (animar) {
    raiz.classList.add('tema-trocando')
    window.setTimeout(() => raiz.classList.remove('tema-trocando'), 500)
  }
  raiz.dataset.theme = tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA[tema])
  window.dispatchEvent(new Event(EVENTO))
}

export function iniciarTema() {
  aplicarTema(temaInicial())
}

export function alternarTema() {
  const novo = temaAtual() === 'light' ? 'dark' : 'light'
  try { window.localStorage.setItem(CHAVE, novo) } catch { /* vale só para esta visita */ }
  aplicarTema(novo, { animar: true })
}

function observar(callback) {
  window.addEventListener(EVENTO, callback)
  return () => window.removeEventListener(EVENTO, callback)
}

// Quem usa este hook renderiza de novo quando o tema muda. O App o usa na raiz,
// então as cores calculadas por corTema() em qualquer tela acompanham a troca.
export function useTema() {
  return useSyncExternalStore(observar, temaAtual, () => 'dark')
}

function paraHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function paraHex(h, s, l) {
  const a = s * Math.min(l, 1 - l)
  const canal = (n) => {
    const k = (n + h / 30) % 12
    const valor = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(valor * 255).toString(16).padStart(2, '0')
  }
  return `#${canal(0)}${canal(8)}${canal(4)}`
}

const escurecidas = new Map()

// As cores de dados (planetas, elementos, aspectos, mapas) são tons pastel pensados
// para o fundo escuro. No tema claro, a mesma matiz é escurecida para manter a leitura.
// Devolve sempre "#rrggbb", então continua valendo concatenar alfa (`${cor}55`).
export function corTema(hex) {
  if (temaAtual() !== 'light' || !/^#[0-9a-f]{6}$/i.test(hex || '')) return hex
  if (!escurecidas.has(hex)) {
    const [h, s, l] = paraHsl(hex)
    // amarelos, verdes e cianos são mais luminosos: precisam descer mais
    const alvo = h >= 40 && h <= 190 ? 0.27 : 0.36
    escurecidas.set(hex, l <= alvo + 0.06 ? hex : paraHex(h, Math.min(s, 0.72), alvo))
  }
  return escurecidas.get(hex)
}

// Envolve um objeto de visual ({ cor } ou { color }) para a cor sair já ajustada ao tema a cada leitura
export function comCorTema(visual) {
  const copia = { ...visual }
  for (const chave of ['cor', 'color']) {
    if (chave in visual) Object.defineProperty(copia, chave, { enumerable: true, get: () => corTema(visual[chave]) })
  }
  return copia
}

export function mapaDeCores(cores) {
  const saida = {}
  for (const [chave, valor] of Object.entries(cores)) {
    Object.defineProperty(saida, chave, { enumerable: true, get: () => corTema(valor) })
  }
  return saida
}

export function mapaDeVisuais(visuais) {
  return Object.fromEntries(Object.entries(visuais).map(([chave, visual]) => [chave, comCorTema(visual)]))
}
