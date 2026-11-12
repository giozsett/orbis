// Glifos astrológicos compartilhados pela mandala e pelas demais páginas.
import { mapaDeCores, mapaDeVisuais } from './tema'

// Força a apresentação em texto (sem emoji) dos glifos astrológicos
export const TXT = '︎'

export const FONTE_GLIFOS = "'Noto Sans Symbols 2', 'Segoe UI Symbol', 'DejaVu Sans', sans-serif"

export const ELEMENTOS = mapaDeCores({
  fogo: '#ff8fa8',
  terra: '#d9b06b',
  ar: '#c3a6ff',
  agua: '#9cc4ff',
})

export const SIGNOS = [
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

// Mesma paleta do PDF: tons claros para o fundo escuro; no tema claro saem escurecidos (ver corTema)
export const PLANETAS = mapaDeVisuais({
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
})

export function signoPorNome(nome) {
  return SIGNOS.find((signo) => signo.nome === nome)
}
