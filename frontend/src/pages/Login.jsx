import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EsferaArmilar from '../components/ui/EsferaArmilar'
import FundoOrbis from '../components/ui/FundoOrbis'

function CampoTexto({ rotulo, icone, acaoRotulo, alternarVisibilidade, ...inputProps }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="font-label text-[11px] uppercase tracking-[0.14em] text-outline">{rotulo}</label>
        {acaoRotulo}
      </div>
      <div className="group flex h-14 items-center rounded-2xl border border-white/10 bg-surface-container-lowest/60 px-4 transition-all duration-300 focus-within:border-primary/60 focus-within:bg-surface-container-lowest/80 focus-within:shadow-[0_0_18px_rgba(255,75,137,0.15)]">
        <span className="material-symbols-outlined mr-3 text-outline transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-primary">{icone}</span>
        <input
          {...inputProps}
          className="w-full border-none bg-transparent text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
        />
        {alternarVisibilidade && (
          <button
            type="button"
            onClick={alternarVisibilidade.onClick}
            className="text-outline transition-colors hover:text-on-surface"
            aria-label={alternarVisibilidade.visivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={alternarVisibilidade.visivel}
          >
            <span className="material-symbols-outlined">{alternarVisibilidade.visivel ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

function BotaoPrincipal({ children, icone = 'arrow_forward' }) {
  return (
    <button
      type="submit"
      className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-orbis-cta font-label text-[13px] uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(255,75,137,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(255,75,137,0.38)] active:scale-[0.98]"
    >
      {/* brilho que atravessa o botão no hover */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[350%]" />
      <span className="relative">{children}</span>
      <span className="material-symbols-outlined relative text-base transition-transform group-hover:translate-x-1">{icone}</span>
    </button>
  )
}

function BotaoSecundario({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-secondary/20 px-8 py-2 font-label text-xs uppercase tracking-[0.08em] text-secondary transition-all hover:border-secondary/60 hover:bg-secondary/5"
    >
      {children}
    </button>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [recuperandoSenha, setRecuperandoSenha] = useState(false)
  const [emailRecuperacaoVerificado, setEmailRecuperacaoVerificado] = useState(false)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [manterConectado, setManterConectado] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false)
  const [mostrarSenhaCadastro, setMostrarSenhaCadastro] = useState(false)
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    novaSenha: '',
    confirmacaoNovaSenha: '',
  })

  useEffect(() => {
    fetch('/acesso/sessao', { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        if (data.autenticado) navigate('/dashboard', { replace: true })
      })
      .catch(() => {})
      .finally(() => setVerificandoSessao(false))
  }, [navigate])

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErro('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')

    const body = new URLSearchParams({
      email: formData.email,
      senha: formData.senha,
      manter_conectado: String(manterConectado),
    })

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

    if (formData.senha !== formData.confirmacaoSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    const body = new URLSearchParams({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      confirmacao_senha: formData.confirmacaoSenha,
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

  const handleVerificarEmail = async (e) => {
    e.preventDefault()
    setErro('')
    try {
      const res = await fetch('/acesso/recuperar-senha/verificar-email', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new URLSearchParams({ email: formData.email }),
      })
      const data = await res.json()
      if (!res.ok) return setErro(data.erro || 'Não foi possível verificar o e-mail.')
      setEmailRecuperacaoVerificado(true)
    } catch {
      setErro('Erro de conexão com o servidor.')
    }
  }

  const handleRedefinirSenha = async (e) => {
    e.preventDefault()
    setErro('')
    if (formData.novaSenha !== formData.confirmacaoNovaSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    try {
      const res = await fetch('/acesso/recuperar-senha/redefinir', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new URLSearchParams({
          email: formData.email,
          nova_senha: formData.novaSenha,
          confirmacao_senha: formData.confirmacaoNovaSenha,
        }),
      })
      const data = await res.json()
      if (!res.ok) return setErro(data.erro || 'Não foi possível alterar a senha.')
      setFormData((prev) => ({ ...prev, senha: '', novaSenha: '', confirmacaoNovaSenha: '' }))
      setEmailRecuperacaoVerificado(false)
      setRecuperandoSenha(false)
      setIsLogin(true)
    } catch {
      setErro('Erro de conexão com o servidor.')
    }
  }

  const irParaLogin = () => {
    setIsLogin(true)
    setRecuperandoSenha(false)
    setEmailRecuperacaoVerificado(false)
    setErro('')
  }

  const irParaCadastro = () => {
    setIsLogin(false)
    setRecuperandoSenha(false)
    setEmailRecuperacaoVerificado(false)
    setErro('')
  }

  if (verificandoSessao) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden">
        <FundoOrbis />
        <div className="relative z-[2] flex flex-col items-center gap-8">
          <div className="motion-safe:animate-orbis-float">
            <EsferaArmilar animada className="h-48 w-48 opacity-80 motion-safe:animate-orbis-sphere-in" />
          </div>
          <p className="font-label text-xs uppercase tracking-[0.22em] text-outline motion-safe:animate-orbis-twinkle">Restaurando sua sessão</p>
        </div>
      </div>
    )
  }

  const mostrandoCadastro = !isLogin && !recuperandoSenha

  return (
    <div className="relative min-h-dvh overflow-x-hidden text-on-surface">
      <FundoOrbis />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-white/[0.08] bg-surface/45 px-3.5 backdrop-blur-[18px] motion-safe:animate-orbis-header sm:px-[clamp(16px,4vw,64px)]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary motion-safe:animate-orbis-twinkle">auto_awesome</span>
          <span className="font-headline text-lg font-bold tracking-[-0.03em] text-secondary sm:text-[22px]">ORBIS</span>
        </div>
      </header>

      {/* Recorte cream no canto: alterna entre entrar e criar conta */}
      <div className="fixed right-0 top-0 z-[52] flex h-[72px] items-start justify-end rounded-bl-[34px] bg-cream pl-[18px] pr-4 pt-3 shadow-[-22px_24px_46px_rgba(0,0,0,0.4)] motion-safe:animate-orbis-drop sm:h-[92px] sm:w-[clamp(230px,28vw,340px)] sm:rounded-bl-[58px] sm:pl-6 sm:pr-[clamp(16px,4vw,48px)] sm:pt-3.5">
        <button
          type="button"
          onClick={mostrandoCadastro ? irParaLogin : irParaCadastro}
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-on-cream/25 px-3 py-2 font-label text-[11px] font-semibold uppercase tracking-[0.08em] text-on-cream transition-all hover:border-on-cream hover:bg-on-cream/[0.06] sm:px-[18px] sm:py-2.5 sm:text-xs"
        >
          <span key={mostrandoCadastro ? 'login' : 'cadastro'} className="material-symbols-outlined text-base motion-safe:animate-orbis-swap">{mostrandoCadastro ? 'login' : 'person_add'}</span>
          <span>{mostrandoCadastro ? 'Entrar' : 'Criar conta'}</span>
        </button>
      </div>

      <main className="relative z-[2] flex min-h-dvh flex-col items-center gap-8 px-4 pb-12 pt-24 xs:px-5 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-28 lg:flex-row lg:gap-[clamp(24px,5vw,72px)] lg:py-24 lg:pl-[clamp(24px,8vw,140px)] lg:pr-[clamp(24px,6vw,120px)]">
        {/* Texto do hero */}
        <div className="max-w-[560px] text-center lg:text-left">
          <p className="mb-5 font-label text-[11px] uppercase tracking-[0.32em] text-primary motion-safe:animate-orbis-rise sm:text-xs" style={{ animationDelay: '150ms' }}>Mapa natal · observatório celeste</p>
          <div style={{ animationDelay: '280ms' }} className="relative inline-block px-[22px] py-3.5 motion-safe:animate-orbis-rise motion-safe:before:animate-orbis-bracket motion-safe:after:animate-orbis-bracket before:absolute before:left-0 before:top-0 before:h-[26px] before:w-[26px] before:border-l-2 before:border-t-2 before:border-primary before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-[26px] after:w-[26px] after:border-b-2 after:border-r-2 after:border-primary after:content-[''] sm:px-[34px] sm:py-[18px]">
            <h1 className="bg-orbis-wordmark bg-[length:250%_100%] bg-clip-text font-headline motion-safe:animate-orbis-shimmer text-[clamp(48px,9vw,88px)] font-bold leading-[0.92] tracking-[0.06em] text-transparent">
              ORBIS
            </h1>
          </div>
          <p className="ml-1 mt-5 font-label text-sm italic tracking-[0.08em] text-outline motion-safe:animate-orbis-rise" style={{ animationDelay: '430ms' }}>o mapa do céu no instante em que você nasceu</p>
          <p className="mx-auto mt-6 hidden max-w-[440px] leading-[1.7] text-on-surface-variant motion-safe:animate-orbis-rise sm:block lg:mx-0" style={{ animationDelay: '560ms' }}>
            Calcule seu mapa natal, explore interpretações planetárias e acompanhe trânsitos do dia — tudo em um observatório pessoal, guiado pelas posições exatas do céu.
          </p>
        </div>

        {/* Card de autenticação sobre a esfera armilar */}
        <div className="relative flex w-full min-w-0 flex-1 items-center justify-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(135%,700px)] -translate-x-1/2 -translate-y-1/2 opacity-30 lg:opacity-50">
            <div className="motion-safe:animate-orbis-float">
              <EsferaArmilar animada className="w-full motion-safe:animate-orbis-sphere-in" />
            </div>
          </div>

          <div className="relative w-full max-w-[460px] rounded-[24px] border border-white/10 bg-surface-container-lowest/75 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45),inset_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl motion-safe:animate-orbis-card-in xs:p-6 sm:p-8">
            {erro && (
              <div key={erro} className="mb-6 flex items-center gap-3 rounded-2xl border border-error/30 bg-error-container/20 p-4 motion-safe:animate-orbis-shake">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="font-label text-sm text-error">{erro}</p>
              </div>
            )}

            {recuperandoSenha ? (
              <div className="motion-safe:animate-orbis-swap">
                <header className="mb-6">
                  <h2 className="mb-1 font-headline text-3xl text-on-surface">Alterar senha</h2>
                  <p className="text-on-surface-variant/80">
                    {emailRecuperacaoVerificado ? 'Crie uma nova senha para sua conta.' : 'Informe o e-mail cadastrado na sua conta.'}
                  </p>
                </header>

                {!emailRecuperacaoVerificado ? (
                  <form className="space-y-5" onSubmit={handleVerificarEmail}>
                    <CampoTexto rotulo="E-mail" icone="alternate_email" type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="astronauta@orbis.com" required />
                    <BotaoPrincipal>Verificar e-mail</BotaoPrincipal>
                  </form>
                ) : (
                  <form className="space-y-5 motion-safe:animate-orbis-swap" onSubmit={handleRedefinirSenha}>
                    {[['novaSenha', 'Nova senha', 'Crie uma nova senha'], ['confirmacaoNovaSenha', 'Confirmar nova senha', 'Digite a nova senha novamente']].map(([campo, rotulo, placeholder]) => (
                      <CampoTexto key={campo} rotulo={rotulo} icone="lock_reset" type="password" minLength={6} value={formData[campo]} onChange={(e) => updateForm(campo, e.target.value)} placeholder={placeholder} required />
                    ))}
                    <p className="text-xs text-outline">A senha deve ter pelo menos 6 caracteres.</p>
                    <BotaoPrincipal>Alterar senha</BotaoPrincipal>
                  </form>
                )}

                <div className="mt-6 flex justify-center border-t border-white/5 pt-5">
                  <button onClick={irParaLogin} className="font-label text-sm text-secondary transition-colors hover:text-primary">
                    Voltar para o login
                  </button>
                </div>
                <p className="mt-4 text-center text-[11px] leading-relaxed text-outline">Fluxo temporário do MVP. Uma versão futura deverá confirmar a identidade por e-mail.</p>
              </div>
            ) : isLogin ? (
              <div className="motion-safe:animate-orbis-swap">
                <header className="mb-6">
                  <h2 className="mb-1 font-headline text-3xl text-on-surface">Bem-vindo de volta</h2>
                  <p className="text-on-surface-variant/80">Acesse seus dados orbitais e transições celestes.</p>
                </header>

                <form className="space-y-5" onSubmit={handleLogin}>
                  <CampoTexto rotulo="E-mail" icone="alternate_email" type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="astronauta@orbis.com" required />
                  <CampoTexto
                    rotulo="Senha"
                    icone="lock"
                    type={mostrarSenhaLogin ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => updateForm('senha', e.target.value)}
                    placeholder="••••••••"
                    required
                    alternarVisibilidade={{ visivel: mostrarSenhaLogin, onClick: () => setMostrarSenhaLogin((valor) => !valor) }}
                    acaoRotulo={
                      <button type="button" onClick={() => { setRecuperandoSenha(true); setErro('') }} className="font-label text-xs text-primary transition-colors hover:text-primary-container">
                        Esqueceu sua senha?
                      </button>
                    }
                  />

                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={manterConectado}
                      onChange={(event) => setManterConectado(event.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-surface-container-highest accent-primary-container"
                    />
                    <label htmlFor="remember" className="cursor-pointer font-label text-xs text-on-surface-variant">
                      Manter-me conectado
                    </label>
                  </div>

                  <BotaoPrincipal>Entrar</BotaoPrincipal>
                </form>

                <div className="mt-6 flex flex-col items-center border-t border-white/5 pt-5">
                  <p className="mb-3 text-on-surface-variant">Novo no observatório?</p>
                  <BotaoSecundario onClick={irParaCadastro}>Criar uma conta</BotaoSecundario>
                </div>
              </div>
            ) : (
              <div className="motion-safe:animate-orbis-swap">
                <header className="mb-6">
                  <h2 className="mb-1 font-headline text-3xl text-on-surface">Iniciar minha jornada</h2>
                  <p className="text-on-surface-variant/80">Junte-se à maior rede de observação astronômica.</p>
                </header>

                <form className="space-y-5" onSubmit={handleCadastro}>
                  <CampoTexto rotulo="Nome completo" icone="person" type="text" value={formData.nome} onChange={(e) => updateForm('nome', e.target.value)} placeholder="Seu nome" required />
                  <CampoTexto rotulo="E-mail" icone="alternate_email" type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="astronauta@orbis.com" required />
                  <CampoTexto
                    rotulo="Senha"
                    icone="lock"
                    type={mostrarSenhaCadastro ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => updateForm('senha', e.target.value)}
                    placeholder="Crie uma senha forte"
                    required
                    alternarVisibilidade={{ visivel: mostrarSenhaCadastro, onClick: () => setMostrarSenhaCadastro((valor) => !valor) }}
                  />
                  <CampoTexto
                    rotulo="Confirmar senha"
                    icone="lock_reset"
                    type={mostrarConfirmacaoSenha ? 'text' : 'password'}
                    value={formData.confirmacaoSenha}
                    onChange={(e) => updateForm('confirmacaoSenha', e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    alternarVisibilidade={{ visivel: mostrarConfirmacaoSenha, onClick: () => setMostrarConfirmacaoSenha((valor) => !valor) }}
                  />

                  <BotaoPrincipal icone="rocket_launch">Criar conta</BotaoPrincipal>
                </form>

                <div className="mt-6 flex flex-col items-center border-t border-white/5 pt-5">
                  <p className="mb-3 text-on-surface-variant">Já possui acesso?</p>
                  <BotaoSecundario onClick={irParaLogin}>Fazer login</BotaoSecundario>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-5 left-6 z-30 hidden rounded-full border border-white/[0.08] bg-surface-container-low/50 px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.18em] text-outline backdrop-blur-sm motion-safe:animate-orbis-rise sm:block" style={{ animationDelay: '900ms' }}>
        ORBIS · mapa natal
      </div>
    </div>
  )
}
