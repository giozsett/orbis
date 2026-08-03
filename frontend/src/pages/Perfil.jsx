import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import GlassPanel from '../components/ui/GlassPanel'


export default function Perfil() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/acesso/perfil', { headers: { Accept: 'application/json' } })
      .then(async response => {
        const data = await response.json()
        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        if (!response.ok) throw new Error(data.erro || 'Não foi possível carregar o perfil.')
        setUsuario(data.usuario)
      })
      .catch(error => setErro(error.message))
  }, [navigate])

  const iniciais = useMemo(() => {
    if (!usuario?.nome) return 'OR'
    return usuario.nome.split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()
  }, [usuario])

  if (erro) return <Layout showSidebar={false}><div className="p-8 md:p-16 text-error">{erro}</div></Layout>
  if (!usuario) return <Layout showSidebar={false}><div className="p-8 md:p-16 text-outline">Carregando perfil…</div></Layout>

  const membroDesde = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(usuario.criado_em))

  return (
    <Layout showSidebar={false}>
      <div className="min-h-[calc(100vh-64px)] px-4 py-10 md:px-12 md:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="animate-fade-in-up">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Conta ORBIS</span>
            <h1 className="font-headline text-4xl md:text-5xl mt-2">Meu Perfil</h1>
            <p className="text-on-surface-variant mt-3">Seus dados de acesso e sua jornada pelo observatório.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <GlassPanel className="p-8 flex flex-col items-center text-center animate-fade-in-up">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-container/60 to-tertiary-container/40 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,177,195,0.12)]">
                <span className="font-headline text-3xl text-secondary">{iniciais}</span>
              </div>
              <h2 className="font-headline text-2xl mt-5">{usuario.nome}</h2>
              <p className="text-outline text-sm mt-1">{usuario.email}</p>
              <div className="mt-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-xs uppercase tracking-wider">
                Membro desde {membroDesde}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">badge</span>
                <h2 className="font-headline text-2xl">Dados da conta</h2>
              </div>

              <dl className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-white/5">
                  <dt className="font-label text-xs text-outline uppercase tracking-widest">Nome</dt>
                  <dd className="mt-2 text-on-surface">{usuario.nome}</dd>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-white/5">
                  <dt className="font-label text-xs text-outline uppercase tracking-widest">E-mail</dt>
                  <dd className="mt-2 text-on-surface">{usuario.email}</dd>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <dt className="font-label text-xs text-outline uppercase tracking-widest">Mapas natais</dt>
                    <dd className="mt-2 text-on-surface">{usuario.total_mapas} {usuario.total_mapas === 1 ? 'mapa criado' : 'mapas criados'}</dd>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-secondary">blur_circular</span>
                </div>
              </dl>
            </GlassPanel>
          </div>
        </div>
      </div>
    </Layout>
  )
}
