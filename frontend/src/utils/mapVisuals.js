import { comCorTema, mapaDeVisuais } from './tema'

export const PLANET_VISUALS = mapaDeVisuais({
  Sol: { icon: 'sunny', color: '#ffd16a' },
  Lua: { icon: 'nightlight', color: '#d9c5ff' },
  Mercúrio: { icon: 'auto_awesome_motion', color: '#c3a6ff' },
  Vênus: { icon: 'favorite', color: '#ff4b89' },
  Marte: { icon: 'local_fire_department', color: '#ffb4ab' },
  Júpiter: { icon: 'expand_circle_up', color: '#9a6dfd' },
  Saturno: { icon: 'schedule', color: '#8a93ba' },
  Urano: { icon: 'public', color: '#8bc5ff' },
  Netuno: { icon: 'water_drop', color: '#8fd9d1' },
  Plutão: { icon: 'diamond', color: '#d9b8ff' },
  'Nodo Norte': { icon: 'route', color: '#f4c2d7' },
})

export const ASPECT_VISUALS = mapaDeVisuais({
  'conjunção': { symbol: '☌', color: '#a9b8ff' },
  sextil: { symbol: '⚹', color: '#c3a6ff' },
  quadratura: { symbol: '□', color: '#ffb4ab' },
  'trígono': { symbol: '△', color: '#e0b96e' },
  'oposição': { symbol: '☍', color: '#ff4b89' },
})

export function visualPlaneta(nome) {
  return PLANET_VISUALS[nome] || comCorTema({ icon: 'blur_on', color: '#a9b8ff' })
}
