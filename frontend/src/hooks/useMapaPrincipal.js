import { useEffect, useState } from 'react'

export default function useMapaPrincipal() {
  const [mapa, setMapa] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/mapas/principal', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.assign('/login')
          return null
        }
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload.mapa) throw new Error(payload.erro || 'Não foi possível carregar o mapa principal.')
        return payload.mapa
      })
      .then((resultado) => resultado && setMapa(resultado))
      .catch((error) => setErro(error.message))
  }, [])

  return { mapa, erro }
}
