// Itens de navegação compartilhados entre a barra superior (desktop),
// a tab bar inferior e as folhas do mobile.

export const mapaGroup = {
  id: 'mapa',
  label: 'Mapa Natal',
  match: (path) => path === '/mapa' || path.startsWith('/mapa/') || path === '/meus-mapas' || path === '/interpretacoes',
  items: [
    { path: '/mapa', label: 'Mapa principal', icon: 'explore' },
    { path: '/meus-mapas', label: 'Meus mapas', icon: 'folder_supervised' },
    { path: '/interpretacoes', label: 'Interpretações', icon: 'auto_stories' },
  ],
}

export const horoscopoGroup = {
  id: 'horo',
  label: 'Horóscopo',
  match: (path) => path === '/horoscopo' || path.startsWith('/horoscopos-malucos'),
  items: [
    { path: '/horoscopo', label: 'Horóscopo do dia', icon: 'calendar_today' },
    { path: '/horoscopos-malucos', label: 'Horóscopos malucos', icon: 'psychology' },
  ],
}

export const ehRotaTarot = (path) => path === '/arcanos' || path === '/matriz-do-destino'

export const tarotGroup = {
  id: 'tarot',
  label: 'Tarot',
  match: ehRotaTarot,
  items: [
    { path: '/arcanos', label: 'Arcanos', icon: 'style' },
    { path: '/matriz-do-destino', label: 'Matriz do destino', icon: 'pentagon' },
  ],
}

export const navGroups = [mapaGroup, tarotGroup, horoscopoGroup]

export const temasMalucos = [
  { path: '/horoscopos-malucos', label: 'Distros Linux', icon: 'linux' },
]

// Páginas técnicas do mapa selecionado (sidebar no desktop, folha no mobile)
export const detalhesMapa = [
  { icon: 'blur_on', label: 'Dados planetários', path: '/mapa/posicoes' },
  { icon: 'grid_4x4', label: 'Grade de aspectos', path: '/mapa/aspectos' },
  { icon: 'home_pin', label: 'Casas', path: '/mapa/casas' },
  { icon: 'settings_backup_restore', label: 'Retrógrados', path: '/mapa/retrogrados' },
  { icon: 'star', label: 'Asteroides', path: '/mapa/asteroides' },
]

export const ehRotaMapa = (path) => path === '/mapa' || path.startsWith('/mapa/')

// Abas fixas da tab bar inferior (abaixo de lg)
export const abasMobile = [
  { id: 'inicio', path: '/dashboard', label: 'Início', icon: 'home', match: (path) => path === '/dashboard' || path === '/criar-mapa' },
  { id: 'mapa', path: '/mapa', label: 'Mapa', icon: 'explore', match: ehRotaMapa },
  { id: 'horo', path: '/horoscopo', label: 'Horóscopo', icon: 'calendar_today', match: horoscopoGroup.match },
  { id: 'chat', path: '/chat', label: 'Chat', icon: 'forum', match: (path) => path === '/chat' },
]

// Itens da folha "Mais"
export const itensMais = [
  { path: '/meus-mapas', label: 'Meus mapas', icon: 'folder_supervised' },
  { path: '/interpretacoes', label: 'Interpretações', icon: 'auto_stories' },
  { path: '/arcanos', label: 'Arcanos', icon: 'style' },
  { path: '/matriz-do-destino', label: 'Matriz do destino', icon: 'pentagon' },
  { path: '/horoscopos-malucos', label: 'Horóscopos malucos', icon: 'psychology' },
  { path: '/criar-mapa', label: 'Criar novo mapa', icon: 'add_circle' },
  { path: '/perfil', label: 'Meu perfil', icon: 'account_circle' },
]

export const ehRotaMais = (path) => ['/meus-mapas', '/interpretacoes', '/perfil'].includes(path) || ehRotaTarot(path)

export async function encerrarSessao() {
  try {
    await fetch('/acesso/logout', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
  } catch {
    // mesmo sem resposta, volta para o login
  }
}
