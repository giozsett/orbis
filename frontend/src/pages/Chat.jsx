import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Layout from '../components/layout/Layout'
import GlassPanel from '../components/ui/GlassPanel'

function formatarHorario(data) {
  if (!data) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(data))
}

function formatarLiberacao(data) {
  if (!data) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(data))
}

function formatarDataHistorico(data) {
  if (!data) return ''
  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const ontemData = new Date(`${hoje}T12:00:00-03:00`)
  ontemData.setUTCDate(ontemData.getUTCDate() - 1)
  const ontem = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(ontemData)
  if (data === hoje) return 'Hoje'
  if (data === ontem) return 'Ontem'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(`${data}T12:00:00-03:00`))
}

function mensagensDoEstado(payload) {
  return payload.mensagens?.length
    ? payload.mensagens
    : [{ id: 'saudacao', papel: 'assistant', mensagem: payload.saudacao, criado_em: new Date().toISOString() }]
}

export default function Chat() {
  const [dados, setDados] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [diasHistorico, setDiasHistorico] = useState([])
  const [cursorHistorico, setCursorHistorico] = useState(null)
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)
  const [carregandoDia, setCarregandoDia] = useState(false)
  const [erroHistorico, setErroHistorico] = useState('')
  const [diaVisualizado, setDiaVisualizado] = useState(null)
  const messagesEndRef = useRef(null)

  const aplicarEstadoAtual = (payload) => {
    setDados(payload)
    setMessages(mensagensDoEstado(payload))
    setDiaVisualizado(payload.dia_atual?.data || null)
  }

  const buscarEstadoAtual = async () => {
    const response = await fetch('/chat', { credentials: 'include', headers: { Accept: 'application/json' } })
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401) { window.location.assign('/login'); return null }
    if (!response.ok) { setDados({ codigo: payload.codigo, erro: payload.erro }); return null }
    aplicarEstadoAtual(payload)
    return payload
  }

  useEffect(() => {
    const carregar = async () => {
      try {
        await buscarEstadoAtual()
      } catch {
        setErro('Não foi possível carregar o Chat Astral agora.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const carregarHistorico = async ({ cursor = null, acumular = false } = {}) => {
    if (carregandoHistorico) return
    setCarregandoHistorico(true)
    setErroHistorico('')
    try {
      const query = new URLSearchParams({ limite: '20' })
      if (cursor) query.set('cursor', cursor)
      const response = await fetch(`/chat/historico?${query}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.erro || 'Não foi possível carregar o histórico.')
      setDiasHistorico(atuais => acumular ? [...atuais, ...payload.dias] : payload.dias)
      setCursorHistorico(payload.proximo_cursor)
    } catch (error) {
      setErroHistorico(error.message)
    } finally {
      setCarregandoHistorico(false)
    }
  }

  const abrirHistorico = () => {
    setHistoricoAberto(true)
    carregarHistorico()
  }

  const abrirDia = async (data) => {
    setCarregandoDia(true)
    setErroHistorico('')
    try {
      const response = await fetch(`/chat/historico/${data}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.erro || 'Não foi possível abrir esta conversa.')
      setMessages(payload.mensagens)
      setDiaVisualizado(payload.dia.data)
      setHistoricoAberto(false)
    } catch (error) {
      setErroHistorico(error.message)
    } finally {
      setCarregandoDia(false)
    }
  }

  const voltarParaHoje = async () => {
    setCarregandoDia(true)
    setErro('')
    try { await buscarEstadoAtual() } catch { setErro('Não foi possível voltar à conversa atual.') } finally { setCarregandoDia(false) }
  }

  const sendMessage = async () => {
    const texto = input.trim()
    if (!texto || isLoading || !dados?.limite?.restantes || visualizandoHistorico) return

    const idTemporario = `local-${Date.now()}`
    const userMessage = {
      id: idTemporario,
      papel: 'user',
      mensagem: texto,
      criado_em: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setErro('')
    setIsLoading(true)

    try {
      const response = await fetch('/chat/mensagens', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: texto }),
      })
      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.assign('/login')
        return
      }
      if (!response.ok) throw Object.assign(new Error(payload.erro || 'Não foi possível enviar sua pergunta.'), { payload })

      setMessages((prev) => [
        ...prev.map((item) => (item.id === idTemporario ? payload.mensagem_usuario : item)),
        payload.resposta,
      ])
      setDados((atual) => ({ ...atual, limite: payload.limite, dia_atual: payload.dia }))
      setDiaVisualizado(payload.dia.data)
    } catch (error) {
      setMessages((prev) => prev.filter((item) => item.id !== idTemporario))
      setErro(error.message)
      if (error.payload?.limite) {
        setDados((atual) => ({ ...atual, limite: error.payload.limite }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (carregando) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
        </div>
      </Layout>
    )
  }

  if (dados?.codigo === 'mapa_principal_ausente') {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-8">
          <GlassPanel className="max-w-xl p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-secondary">orbit</span>
            <h1 className="mt-5 font-headline text-3xl">Seu mapa principal vem primeiro</h1>
            <p className="mt-3 text-on-surface-variant">{dados.erro}</p>
            <Link to="/criar-mapa" className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 font-label text-sm text-on-primary">
              Criar mapa principal
            </Link>
          </GlassPanel>
        </div>
      </Layout>
    )
  }

  const limiteAtingido = dados?.limite?.restantes === 0
  const visualizandoHistorico = Boolean(diaVisualizado && diaVisualizado !== dados?.dia_atual?.data)
  const sol = dados?.mapa?.sol
  const lua = dados?.mapa?.lua
  const ascendente = dados?.mapa?.ascendente

  return (
    <Layout showFooter={false}>
      <div className="relative flex h-[calc(100vh-64px)] flex-col overflow-hidden">
        {historicoAberto && <>
          <button type="button" aria-label="Fechar histórico" onClick={() => setHistoricoAberto(false)} className="absolute inset-0 z-20 bg-surface/70 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 z-30 flex w-[min(88vw,360px)] flex-col border-r border-primary/15 bg-surface-container-low/95 p-5 shadow-2xl backdrop-blur-xl animate-slide-in-left" aria-label="Histórico do Chat Astral">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div><p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Conversas</p><h2 className="mt-1 font-headline text-2xl">Histórico Astral</h2></div>
              <button type="button" onClick={() => setHistoricoAberto(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-outline hover:text-on-surface" aria-label="Fechar"><span className="material-symbols-outlined">close</span></button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">Aparecem somente os dias em que você enviou pelo menos uma pergunta.</p>
            {erroHistorico && <p className="mt-4 rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error">{erroHistorico}</p>}
            <div className="custom-scrollbar mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
              {!carregandoHistorico && !diasHistorico.length && <div className="py-12 text-center"><span className="material-symbols-outlined text-5xl text-primary/30">history</span><p className="mt-3 text-sm text-outline">Seu histórico aparecerá após a primeira conversa.</p></div>}
              {diasHistorico.map(dia => <button key={dia.id} type="button" onClick={() => abrirDia(dia.data)} disabled={carregandoDia} className={`w-full rounded-xl border p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/5 ${dia.data === diaVisualizado ? 'border-primary/30 bg-primary/10' : 'border-white/5 bg-white/[.025]'}`}><div className="flex items-center justify-between gap-3"><strong className="font-headline text-lg text-on-surface">{formatarDataHistorico(dia.data)}</strong><span className="rounded-full bg-primary/10 px-2 py-1 font-label text-[9px] text-primary">{dia.quantidade_perguntas} {dia.quantidade_perguntas === 1 ? 'pergunta' : 'perguntas'}</span></div><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">{dia.primeira_pergunta}</p></button>)}
              {carregandoHistorico && <div className="flex items-center justify-center gap-2 py-8 text-xs text-outline"><span className="material-symbols-outlined animate-spin">progress_activity</span>Carregando histórico…</div>}
              {cursorHistorico && !carregandoHistorico && <button type="button" onClick={() => carregarHistorico({ cursor: cursorHistorico, acumular: true })} className="w-full rounded-lg border border-white/10 py-3 font-label text-xs text-outline hover:text-primary">Carregar dias anteriores</button>}
            </div>
          </aside>
        </>}
        <div className="flex items-center justify-between gap-4 border-b border-white/5 bg-surface/20 p-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface-container">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-headline text-xl">Assistente Orbis</h2>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="truncate font-label text-xs text-outline">Mapa principal · {dados?.mapa?.nome}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={abrirHistorico} className="flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 font-label text-xs text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"><span className="material-symbols-outlined text-lg">history</span><span className="hidden sm:inline">Histórico</span></button>
            <div className={`rounded-lg border px-3 py-2 text-right ${limiteAtingido ? 'border-error/30 bg-error/10' : 'border-primary/20 bg-primary/10'}`}>
              <p className="font-label text-[10px] uppercase text-outline">Perguntas em 24h</p>
              <p className={`font-label text-sm ${limiteAtingido ? 'text-error' : 'text-primary'}`}>
                {dados?.limite?.restantes} de {dados?.limite?.total} restantes
              </p>
            </div>
            <div className="hidden gap-2 xl:flex">
              {sol?.signo && <div className="rounded border border-primary/20 bg-primary/10 px-3 py-1 font-label text-xs text-primary">Sol em {sol.signo}</div>}
              {lua?.signo && <div className="rounded border border-tertiary/20 bg-tertiary/10 px-3 py-1 font-label text-xs text-tertiary">Lua em {lua.signo}</div>}
              {ascendente?.signo && <div className="rounded border border-secondary/20 bg-secondary/10 px-3 py-1 font-label text-xs text-secondary">Asc. {ascendente.signo}</div>}
            </div>
          </div>
        </div>

        {limiteAtingido && (
          <div className="border-b border-error/20 bg-error/10 px-4 py-2 text-center text-xs text-error">
            Seu limite foi atingido. Uma pergunta será liberada em {formatarLiberacao(dados.limite.reset_em)}.
          </div>
        )}

        {visualizandoHistorico && <div className="flex items-center justify-center gap-3 border-b border-tertiary/20 bg-tertiary/10 px-4 py-2 text-xs text-tertiary"><span>Visualizando a conversa de {formatarDataHistorico(diaVisualizado)}.</span><button type="button" onClick={voltarParaHoje} disabled={carregandoDia} className="font-label underline underline-offset-2 disabled:opacity-50">Voltar para hoje</button></div>}

        <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
          {messages.map((message) => {
            const isUser = message.papel === 'user'
            return (
              <div key={message.id} className={`flex max-w-[85%] flex-col gap-1 lg:max-w-[70%] ${isUser ? 'self-end items-end' : ''}`}>
                <div className={`rounded-2xl p-4 ${
                  isUser
                    ? 'rounded-tr-none bg-gradient-to-br from-primary-container to-on-primary text-white'
                    : 'rounded-tl-none border-t border-white/10 bg-surface-container-highest/50'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.mensagem}</p>
                </div>
                <span className="mx-1 font-label text-[10px] text-outline">{formatarHorario(message.criado_em)}</span>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex max-w-[85%] flex-col gap-1 lg:max-w-[70%]">
              <div className="rounded-2xl rounded-tl-none border-t border-white/10 bg-surface-container-highest/50 p-4">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => <div key={delay} className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${delay}ms` }} />)}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {erro && <div className="mx-4 mb-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error lg:mx-6">{erro}</div>}

        <div className="no-scrollbar overflow-x-auto px-4 pb-4 lg:px-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">Perguntas personalizadas para seu mapa</p>
            <p className="font-label text-[10px] text-outline">Selecionar não consome sua cota</p>
          </div>
          <div className="flex gap-3">
            {dados?.sugestoes?.map((sugestao) => (
              <button
                key={sugestao.pergunta}
                type="button"
                disabled={limiteAtingido || isLoading || visualizandoHistorico}
                onClick={() => setInput(sugestao.pergunta)}
                className="group min-w-[270px] max-w-[320px] rounded-xl border border-outline/20 bg-white/[.025] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="mb-1 flex items-center gap-2 font-label text-[10px] uppercase tracking-wider text-primary">
                  <span className="material-symbols-outlined text-base">{sugestao.icone}</span>
                  {sugestao.categoria}
                </span>
                <span className="line-clamp-2 text-sm leading-snug text-on-surface-variant group-hover:text-on-surface">{sugestao.pergunta}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 bg-surface-container-low/80 p-4 backdrop-blur-xl lg:px-6">
          <div className="relative">
            <input
              type="text"
              maxLength={500}
              value={input}
              disabled={limiteAtingido || isLoading || visualizandoHistorico}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
              placeholder={visualizandoHistorico ? 'Volte para hoje para enviar uma pergunta' : limiteAtingido ? 'Limite de perguntas atingido' : 'Pergunte sobre seu mapa natal...'}
              className="w-full rounded-xl border border-outline/20 bg-surface-container-highest px-6 py-4 pr-14 text-sm transition-all focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || limiteAtingido || visualizandoHistorico}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-on-primary transition-all hover:shadow-[0_0_15px_rgba(255,0,122,0.4)] disabled:opacity-50"
              aria-label="Enviar pergunta"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
