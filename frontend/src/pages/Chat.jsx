import { useState, useRef, useEffect } from 'react'
import Layout from '../components/layout/Layout'

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: 'Olá! Estou analisando as configurações celestes de hoje em relação ao seu nascimento. Como posso ajudar na sua jornada astronômica agora?',
    isUser: false,
    time: '10:24',
  },
]

const QUICK_QUESTIONS = [
  '✨ Previsão para amanhã',
  '🪐 Próximo Mercúrio Retrógrado',
  '💎 Cristal ideal hoje',
  '🌙 Significado da Lua em Escorpião',
]

export default function Chat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simular resposta da IA
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: 'Baseado na sua Lua em Escorpião na 10ª casa, Saturno em quadratura hoje sugere um momento de refinamento. Você pode sentir uma pressão para consolidar sua autoridade. É um ciclo de "limpeza" — o que não for essencial será removido para dar espaço ao crescimento sólido.',
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickQuestion = (question) => {
    setInput(question.replace(/[^\wáéíóúÁÉÍÓÚñÑ ]/g, '').trim())
  }

  return (
    <Layout showFooter={false}>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Header do chat */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-surface/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center bg-surface-container">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <div>
              <h2 className="font-headline text-xl">Assistente Orbis</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-label text-xs text-outline">Sincronizado com seu Mapa Natal</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <div className="px-3 py-1 rounded bg-tertiary-container/10 border border-tertiary-container/20 text-tertiary-container font-label text-xs">
              Lua em Escorpião
            </div>
            <div className="px-3 py-1 rounded bg-secondary-container/10 border border-secondary-container/20 text-secondary-container font-label text-xs">
              Sol em Touro
            </div>
          </div>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-1 max-w-[85%] lg:max-w-[70%] ${
                message.isUser ? 'items-end self-end' : ''
              }`}
            >
              <div
                className={`p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-gradient-to-br from-primary-container to-on-primary rounded-tr-none text-white'
                    : 'bg-surface-container-highest/50 border-t border-white/10 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{message.text}</p>
              </div>
              <span className="text-[10px] text-outline font-label mx-1">{message.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col gap-1 max-w-[85%] lg:max-w-[70%]">
              <div className="p-4 rounded-2xl rounded-tl-none bg-surface-container-highest/50 border-t border-white/10">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Perguntas rápidas */}
        <div className="px-4 lg:px-6 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => handleQuickQuestion(question)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-outline/30 text-outline hover:border-primary hover:text-primary transition-all font-label text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 lg:px-6 border-t border-white/5 bg-surface-container-low/80 backdrop-blur-xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Pergunte aos astros..."
              className="w-full bg-surface-container-highest border border-outline/20 rounded-xl py-4 px-6 pr-14 text-sm focus:outline-none focus:border-primary transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(255,0,122,0.4)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
