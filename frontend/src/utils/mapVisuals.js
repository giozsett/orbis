export const PLANET_VISUALS = {
  Sol: { icon: 'sunny', color: '#ffb1c3' },
  Lua: { icon: 'nightlight', color: '#eab9ce' },
  Mercúrio: { icon: 'auto_awesome_motion', color: '#deb7ff' },
  Vênus: { icon: 'favorite', color: '#ff4b89' },
  Marte: { icon: 'local_fire_department', color: '#ffb4ab' },
  Júpiter: { icon: 'expand_circle_up', color: '#b86dfd' },
  Saturno: { icon: 'schedule', color: '#ac878f' },
  Urano: { icon: 'public', color: '#8bc5ff' },
  Netuno: { icon: 'water_drop', color: '#8fd9d1' },
  Plutão: { icon: 'diamond', color: '#d9b8ff' },
  'Nodo Norte': { icon: 'route', color: '#f4c2d7' },
}

export const ASPECT_VISUALS = {
  'conjunção': { symbol: '☌', color: '#ffb1c3' },
  sextil: { symbol: '⚹', color: '#deb7ff' },
  quadratura: { symbol: '□', color: '#ffb4ab' },
  'trígono': { symbol: '△', color: '#eab9ce' },
  'oposição': { symbol: '☍', color: '#ff4b89' },
}

export function visualPlaneta(nome) {
  return PLANET_VISUALS[nome] || { icon: 'blur_on', color: '#ffb1c3' }
}
