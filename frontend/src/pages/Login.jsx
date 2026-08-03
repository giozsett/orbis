import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [erro, setErro] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
  })

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErro('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')

    const body = new URLSearchParams({ email: formData.email, senha: formData.senha })

    try {
      const res = await fetch('/acesso/login', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body,
      })
      const data = await res.json()
      if (res.ok) {
        navigate('/dashboard')
      } else {
        setErro(data.erro || 'E-mail ou senha inválidos.')
      }
    } catch {
      setErro('Erro de conexão com o servidor.')
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro('')

    const body = new URLSearchParams({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
    })

    try {
      const res = await fetch('/acesso/cadastro', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body,
      })
      const data = await res.json()
      if (res.ok) {
        navigate('/dashboard')
      } else {
        setErro(data.erro || 'Erro ao criar conta.')
      }
    } catch {
      setErro('Erro de conexão com o servidor.')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col relative overflow-x-hidden bg-[#020817]">
      {/* Fundo estrelado */}
      <div className="fixed inset-0 z-0 bg-[#020817]">
        <div className="star-field absolute inset-0 opacity-10" />
      </div>

      {/* Glow central */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tertiary-fixed-dim/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Anéis orbitais decorativos */}
      <div className="celestial-orbit fixed pointer-events-none w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit" />
      <div className="celestial-orbit fixed pointer-events-none w-[900px] h-[900px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDirection: 'reverse', animationDuration: '180s' }} />

      {/* Conteúdo principal */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-10 grid items-center gap-6 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
        {/* Marca */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-3 md:mb-5 p-1 bg-primary-container/20 rounded-xl border border-primary/30 animate-float">
            <span className="material-symbols-outlined text-[36px] md:text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              blur_on
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl text-secondary tracking-tighter mb-1">ORBIS</h1>
          <p className="font-label text-sm text-outline tracking-widest uppercase">Observatório Astronômico</p>
          <p className="hidden md:block mt-5 max-w-xs text-on-surface-variant leading-relaxed">
            Seu céu de nascimento transformado em uma jornada pessoal de descoberta.
          </p>
        </div>

        {/* Card de autenticação */}
        <div className="glass-panel rounded-xl overflow-hidden w-full max-w-[520px] mx-auto">
          <div className="p-5 sm:p-6 md:p-8">
            {/* Mensagem de erro */}
            {erro && (
              <div className="mb-6 p-4 rounded-lg bg-error-container/20 border border-error/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="font-label text-sm text-error">{erro}</p>
              </div>
            )}

            {/* Formulário de Login */}
            {isLogin ? (
              <div className="animate-fade-in">
                <header className="mb-6">
                  <h2 className="font-headline text-3xl text-on-surface mb-1">Bem-vindo de volta</h2>
                  <p className="text-on-surface-variant/80">Acesse seus dados orbitais e transições celestes.</p>
                </header>

                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="font-label text-xs text-outline px-1 block">E-MAIL</label>
                    <div className="input-glow flex items-center bg-surface-container-low border border-white/10 rounded-lg px-4 h-14 focus-within:border-primary/60 transition-all">
                      <span className="material-symbols-outlined text-outline mr-3">alternate_email</span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder="astronauta@orbis.com"
                        className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="font-label text-xs text-outline">SENHA</label>
                      <a href="#" className="font-label text-xs text-primary hover:text-primary-container transition-colors">
                        Esqueceu a senha?
                      </a>
                    </div>
                    <div className="input-glow flex items-center bg-surface-container-low border border-white/10 rounded-lg px-4 h-14 focus-within:border-primary/60 transition-all">
                      <span className="material-symbols-outlined text-outline mr-3">lock</span>
                      <input
                        type="password"
                        value={formData.senha}
                        onChange={(e) => updateForm('senha', e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant"
                        required
                      />
                      <button type="button" className="text-outline hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded bg-surface-container-highest border-white/10 text-primary focus:ring-primary" />
                    <label htmlFor="remember" className="font-label text-xs text-on-surface-variant cursor-pointer">
                      Manter-me conectado
                    </label>
                  </div>

                  <button type="submit" className="w-full bg-primary-container text-on-primary-container h-14 rounded-full font-headline flex items-center justify-center gap-2 transition-all active:scale-95 group hover:shadow-[0_0_20px_rgba(255,0,122,0.4)]">
                    <span>Entrar</span>
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center">
                  <p className="text-on-surface-variant mb-3">Novo no observatório?</p>
                  <button
                    onClick={() => { setIsLogin(false); setErro('') }}
                    className="font-label text-sm text-secondary border border-secondary/20 hover:border-secondary/60 hover:bg-secondary/5 px-8 py-2 rounded-full transition-all"
                  >
                    Criar uma conta
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Cadastro */
              <div className="animate-fade-in">
                <header className="mb-6">
                  <h2 className="font-headline text-3xl text-on-surface mb-1">Nova Jornada</h2>
                  <p className="text-on-surface-variant/80">Junte-se à maior rede de observação astronômica.</p>
                </header>

                <form className="space-y-4" onSubmit={handleCadastro}>
                  <div className="space-y-2">
                    <label className="font-label text-xs text-outline px-1 block">NOME COMPLETO</label>
                    <div className="input-glow flex items-center bg-surface-container-low border border-white/10 rounded-lg px-4 h-14 focus-within:border-primary/60 transition-all">
                      <span className="material-symbols-outlined text-outline mr-3">person</span>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => updateForm('nome', e.target.value)}
                        placeholder="Seu nome"
                        className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs text-outline px-1 block">E-MAIL</label>
                    <div className="input-glow flex items-center bg-surface-container-low border border-white/10 rounded-lg px-4 h-14 focus-within:border-primary/60 transition-all">
                      <span className="material-symbols-outlined text-outline mr-3">alternate_email</span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder="astronauta@orbis.com"
                        className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs text-outline px-1 block">SENHA</label>
                    <div className="input-glow flex items-center bg-surface-container-low border border-white/10 rounded-lg px-4 h-14 focus-within:border-primary/60 transition-all">
                      <span className="material-symbols-outlined text-outline mr-3">lock</span>
                      <input
                        type="password"
                        value={formData.senha}
                        onChange={(e) => updateForm('senha', e.target.value)}
                        placeholder="Crie uma senha forte"
                        className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-primary-container text-on-primary-container h-14 rounded-full font-headline flex items-center justify-center gap-2 transition-all active:scale-95 group hover:shadow-[0_0_20px_rgba(255,0,122,0.4)]">
                    <span>Criar Conta</span>
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">rocket_launch</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center">
                  <p className="text-on-surface-variant mb-3">Já possui acesso?</p>
                  <button
                    onClick={() => { setIsLogin(true); setErro('') }}
                    className="font-label text-sm text-secondary border border-secondary/20 hover:border-secondary/60 hover:bg-secondary/5 px-8 py-2 rounded-full transition-all"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decoração secundária */}
        <div className="hidden md:flex md:col-start-2 justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">security</span>
            <span className="font-label text-xs">DADOS CRIPTOGRAFADOS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">public</span>
            <span className="font-label text-xs">STATUS: OPERACIONAL</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 w-full flex justify-center z-10">
        <p className="font-label text-xs text-outline">© 2024 ORBIS ASTRONOMICAL OBSERVATORY</p>
      </footer>
    </div>
  )
}
