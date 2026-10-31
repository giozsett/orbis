import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { corDoMapa, lerCorMapaSelecionado, lerMapaSelecionado, observarMapaSelecionado, salvarCorMapaSelecionado, selecionarMapa } from './useMapaSelecionado'

function nomeArquivo(nome) {
  const seguro = (nome || 'mapa').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `orbis-${seguro || 'mapa'}.pdf`
}

// Sidebar (desktop) e folha do mapa (mobile) montam juntas: compartilha a requisição em andamento.
let listaEmAndamento = null
function buscarMapas() {
  if (!listaEmAndamento) {
    listaEmAndamento = fetch('/mapas', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(async response => (response.ok ? response.json() : { mapas: [] }))
      .finally(() => { listaEmAndamento = null })
  }
  return listaEmAndamento
}

// Estado do "mapa em observação": lista de mapas, seleção, cor e exportação em PDF.
export default function useSidebarMapa() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mapas, setMapas] = useState([])
  const [mapaId, setMapaId] = useState(lerMapaSelecionado)
  const [corPersistida, setCorPersistida] = useState(lerCorMapaSelecionado)
  const [exportando, setExportando] = useState(false)
  const [erroExportacao, setErroExportacao] = useState('')

  useEffect(() => observarMapaSelecionado(setMapaId), [])
  useEffect(() => {
    let ativo = true
    buscarMapas()
      .then(({ mapas: recebidos = [] }) => {
        if (!ativo) return
        setMapas(recebidos)
        const salvo = lerMapaSelecionado()
        const valido = recebidos.some(mapa => mapa.id === salvo)
        if (!valido && recebidos[0]) selecionarMapa(recebidos[0].id, corDoMapa(0))
      })
      .catch(() => ativo && setMapas([]))
    return () => { ativo = false }
  }, [])

  const selecionado = useMemo(() => mapas.find(mapa => mapa.id === mapaId) || mapas[0], [mapas, mapaId])
  const indiceSelecionado = Math.max(0, mapas.findIndex(mapa => mapa.id === selecionado?.id))
  const cor = selecionado ? corDoMapa(indiceSelecionado) : corPersistida

  useEffect(() => {
    if (!selecionado) return
    const novaCor = corDoMapa(indiceSelecionado)
    setCorPersistida(novaCor)
    salvarCorMapaSelecionado(novaCor)
  }, [indiceSelecionado, selecionado])

  const escolherMapa = (mapa) => {
    const novaCor = corDoMapa(Math.max(0, mapas.findIndex(item => item.id === mapa.id)))
    setCorPersistida(novaCor)
    selecionarMapa(mapa.id, novaCor)
    if (/^\/mapa\/\d+$/.test(location.pathname) || location.pathname === '/mapa') navigate(`/mapa/${mapa.id}`)
  }

  const exportarPdf = async () => {
    if (exportando || !selecionado) return
    setExportando(true); setErroExportacao('')
    try {
      const response = await fetch(`/mapas/${selecionado.id}/exportacao?formato=pdf`, { credentials: 'include' })
      const tipo = response.headers.get('content-type') || ''
      if (!response.ok || !tipo.includes('application/pdf')) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.erro || 'Não foi possível gerar o PDF.')
      }
      const arquivo = await response.blob()
      if (arquivo.size > 15 * 1024 * 1024) throw new Error('O relatório excedeu o limite de 15 MB.')
      const url = URL.createObjectURL(arquivo)
      const link = Object.assign(document.createElement('a'), { href: url, download: nomeArquivo(selecionado.nome) })
      document.body.appendChild(link); link.click(); link.remove()
      // o Safari do iOS ainda lê o blob depois do click
      setTimeout(() => URL.revokeObjectURL(url), 4000)
    } catch (error) { setErroExportacao(error.message) } finally { setExportando(false) }
  }

  return { mapas, selecionado, cor, escolherMapa, exportarPdf, exportando, erroExportacao }
}
