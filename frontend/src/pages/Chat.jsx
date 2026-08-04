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

export default function Chat() {
  const [dados, setDados] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await fetch('/chat', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const payload = await response.json().catch(() => ({}))
        if (response.status === 401) {
          window.location.assign('/login')
          return
        }
        if (!response.ok) {
          setDados({ codigo: payload.codigo, erro: payload.erro })
          return
        }
        setDados(payload)
        setMessages(payload.mensagens?.length
          ? payload.mensagens
          : [{
              id: 'saudacao',
              papel: 'assistant',
              mensagem: payload.saudacao,
              criado_em: new Date().toISOString(),
            }])
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

  const sendMessage = async () => {
    const texto = input.trim()
    if (!texto || isLoading || !dados?.limite?.restantes) return

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
      setDados((atual) => ({ ...atual, limite: payload.limite }))
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
  const sol = dados?.mapa?.sol
  const lua = dados?.mapa?.lua
  const ascendente = dados?.mapa?.ascendente

  return (
    <Layout showFooter={false}>
      <div className="flex h-[calc(100vh-64px)] flex-col">
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
                disabled={limiteAtingido || isLoading}
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
              disabled={limiteAtingido || isLoading}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
              placeholder={limiteAtingido ? 'Limite de perguntas atingido' : 'Pergunte sobre seu mapa natal...'}
              className="w-full rounded-xl border border-outline/20 bg-surface-container-highest px-6 py-4 pr-14 text-sm transition-all focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || limiteAtingido}
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
