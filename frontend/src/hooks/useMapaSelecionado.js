import { useEffect, useState } from 'react'

const CHAVE_MAPA = 'orbis:mapa-selecionado'
const CHAVE_COR_MAPA = 'orbis:cor-mapa-selecionado'
const EVENTO_MAPA = 'orbis:mapa-selecionado-alterado'

export const CORES_MAPAS = ['#ffb1c3', '#b9d9ff', '#c9c2ff', '#b8e2d4', '#f2c7a5', '#e7b9d6']

export function corDoMapa(indice = 0) {
  return CORES_MAPAS[indice % CORES_MAPAS.length]
}

export function lerMapaSelecionado() {
  const valor = window.localStorage.getItem(CHAVE_MAPA)
  return valor && /^\d+$/.test(valor) ? Number(valor) : null
}

export function lerCorMapaSelecionado() {
  const cor = window.localStorage.getItem(CHAVE_COR_MAPA)
  return cor && /^#[0-9a-f]{6}$/i.test(cor) ? cor : CORES_MAPAS[0]
}

export function salvarCorMapaSelecionado(cor) {
  if (/^#[0-9a-f]{6}$/i.test(cor || '')) window.localStorage.setItem(CHAVE_COR_MAPA, cor)
}

export function selecionarMapa(mapaId, cor) {
  if (mapaId == null) {
    window.localStorage.removeItem(CHAVE_MAPA)
    window.localStorage.removeItem(CHAVE_COR_MAPA)
  } else {
    window.localStorage.setItem(CHAVE_MAPA, String(mapaId))
    if (cor) salvarCorMapaSelecionado(cor)
  }
  window.dispatchEvent(new CustomEvent(EVENTO_MAPA, { detail: mapaId == null ? null : Number(mapaId) }))
}

export function observarMapaSelecionado(callback) {
  const atualizar = (evento) => callback(evento.type === EVENTO_MAPA ? evento.detail : lerMapaSelecionado())
  window.addEventListener(EVENTO_MAPA, atualizar)
  window.addEventListener('storage', atualizar)
  return () => {
    window.removeEventListener(EVENTO_MAPA, atualizar)
    window.removeEventListener('storage', atualizar)
  }
}

export default function useMapaSelecionado() {
  const [mapaId, setMapaId] = useState(lerMapaSelecionado)
  const [mapa, setMapa] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => observarMapaSelecionado(setMapaId), [])

  useEffect(() => {
    const controller = new AbortController()
    setMapa(null)
    setErro('')
    const endpoint = mapaId ? `/mapas/${mapaId}` : '/mapas/principal'
    fetch(endpoint, { credentials: 'include', headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) { window.location.assign('/login'); return null }
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload.mapa) throw new Error(payload.erro || 'Não foi possível carregar o mapa selecionado.')
        return payload.mapa
      })
      .then((resultado) => resultado && setMapa(resultado))
      .catch((error) => error.name !== 'AbortError' && setErro(error.message))
    return () => controller.abort()
  }, [mapaId])

  return { mapa, mapaId, erro }
}
