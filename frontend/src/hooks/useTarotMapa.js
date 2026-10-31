import { useEffect, useState } from 'react'
import useMapaSelecionado from './useMapaSelecionado'

// Arcanos e Matriz do Destino do mapa selecionado; `ano` muda só o arcano anual.
export default function useTarotMapa(ano) {
  const { mapa, cor, erro: erroMapa } = useMapaSelecionado()
  const [tarot, setTarot] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!mapa?.id) return undefined
    const controller = new AbortController()
    setErro('')
    const consulta = ano ? `?ano=${ano}` : ''
    fetch(`/mapas/${mapa.id}/tarot${consulta}`, { credentials: 'include', headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) { window.location.assign('/login'); return null }
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.erro || 'Não foi possível calcular os arcanos.')
        return payload
      })
      .then((resultado) => resultado && setTarot(resultado))
      .catch((error) => error.name !== 'AbortError' && setErro(error.message))
    return () => controller.abort()
  }, [mapa?.id, ano])

  // ao trocar de mapa, não exibe os dados do anterior
  const atual = tarot && tarot.mapa.id === mapa?.id ? tarot : null
  return { mapa, cor, tarot: atual, erro: erroMapa || erro }
}
