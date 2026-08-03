import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'

export default function CriarMapa() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    data_nascimento: '',
    horario_nascimento: '',
    local_nascimento: '',
    cidade_ibge: '',
  })
  const [sugestoes, setSugestoes] = useState([])
  const [buscandoCidade, setBuscandoCidade] = useState(false)
  const [erroCidade, setErroCidade] = useState('')
  const [erroEnvio, setErroEnvio] = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    const consulta = formData.local_nascimento.trim()
    if (formData.cidade_ibge || consulta.length < 2) {
      setSugestoes([])
      setBuscandoCidade(false)
      return undefined
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setBuscandoCidade(true)
      setErroCidade('')

      try {
        const response = await fetch(
          `/api/localizacoes/cidades?q=${encodeURIComponent(consulta)}&limite=10`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Falha ao buscar cidades.')
        const data = await response.json()
        setSugestoes(data.cidades || [])
        if (!data.cidades?.length) setErroCidade('Nenhuma cidade brasileira encontrada.')
      } catch (error) {
        if (error.name !== 'AbortError') setErroCidade('Não foi possível buscar as cidades.')
      } finally {
        if (!controller.signal.aborted) setBuscandoCidade(false)
      }
    }, 300)

    return () => {
      window.clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [formData.local_nascimento, formData.cidade_ibge])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.cidade_ibge) {
      setErroCidade('Selecione uma cidade da lista de sugestões.')
      setStep(2)
      return
    }

    setErroEnvio('')
    try {
      const response = await fetch('/mapas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        setErroEnvio(data.erro || 'Não foi possível criar o mapa.')
        return
      }
      navigate(data.redirect || '/carregando')
    } catch (_error) {
      setErroEnvio('Não foi possível conectar ao servidor.')
    }
  }

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.data_nascimento && formData.horario_nascimento
      case 2:
        return Boolean(formData.cidade_ibge)
      default:
        return false
    }
  }

  const alterarCidade = (value) => {
    setFormData(prev => ({ ...prev, local_nascimento: value, cidade_ibge: '' }))
    setErroCidade('')
  }

  const selecionarCidade = (cidade) => {
    setFormData(prev => ({
      ...prev,
      local_nascimento: `${cidade.municipio}, ${cidade.uf}`,
      cidade_ibge: cidade.ibge,
    }))
    setSugestoes([])
    setErroCidade('')
  }

  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center px-4 pb-12 pt-20">
        <div className="w-full max-w-2xl">
          {/* Indicador de etapas */}
          <div className="flex justify-between items-center mb-12 px-2">
            <div className="flex items-center gap-4 w-full">
              {[1, 2, 3].map((s) => (
                <div key={s} className="contents">
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      s <= step
                        ? 'bg-primary ring-4 ring-primary/20'
                        : 'bg-surface-container-highest'
                    }`}
                  />
                  {s < 3 && (
                    <div
                      className={`h-px flex-1 transition-all duration-500 ${
                        s < step ? 'bg-primary/40' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-8 md:p-12 relative overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Etapa 1: Dados temporais */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <span className="text-primary font-label uppercase tracking-widest block mb-2">Fase 01</span>
                    <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4">Origem Temporal</h1>
                    <p className="text-on-surface-variant text-lg">
                      Para alinhar as constelações, precisamos saber exatamente quando sua jornada começou.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label text-sm text-secondary block">Data de Nascimento</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.data_nascimento}
                          onChange={(e) => updateForm('data_nascimento', e.target.value)}
                          className="w-full bg-surface-container-low border border-white/10 rounded-lg py-4 px-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
                          required
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                          calendar_month
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <label className="font-label text-sm text-secondary block">Horário Exato</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.horario_nascimento}
                          onChange={(e) => updateForm('horario_nascimento', e.target.value)}
                          className="w-full bg-surface-container-low border border-white/10 rounded-lg py-4 px-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
                          required
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                          schedule
                        </span>
                      </div>
                      <p className="text-xs text-outline italic">Use o horário da certidão de nascimento se possível.</p>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStepValid(1)}
                      className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,0,122,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 2: Localização */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <span className="text-primary font-label uppercase tracking-widest block mb-2">Fase 02</span>
                    <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4">Ponto de Observação</h1>
                    <p className="text-on-surface-variant text-lg">
                      O céu muda dependendo de onde você está na Terra. Informe sua localização.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-label text-sm text-secondary block">Cidade de Nascimento</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                        <input
                          type="text"
                          value={formData.local_nascimento}
                          onChange={(e) => alterarCidade(e.target.value)}
                          placeholder="Digite o nome da cidade..."
                          autoComplete="off"
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={sugestoes.length > 0}
                          aria-controls="sugestoes-cidades"
                          className="w-full bg-surface-container-low border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
                          required
                        />
                        {buscandoCidade && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-outline">Buscando…</span>
                        )}
                      </div>
                      {sugestoes.length > 0 && (
                        <ul id="sugestoes-cidades" role="listbox" className="absolute z-20 w-full mt-2 glass-panel rounded-lg border border-white/10 overflow-y-auto max-h-60 shadow-2xl">
                          {sugestoes.map(cidade => (
                            <li key={cidade.ibge} role="option" aria-selected="false">
                              <button
                                type="button"
                                onClick={() => selecionarCidade(cidade)}
                                className="w-full px-4 py-3 hover:bg-white/5 text-left transition-colors flex justify-between gap-3"
                              >
                                <span>{cidade.municipio}, {cidade.uf}</span>
                                <span className="text-xs text-outline">{cidade.regiao}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {formData.cidade_ibge && <p className="text-xs text-secondary">Cidade validada.</p>}
                      {erroCidade && <p className="text-xs text-error" role="alert">{erroCidade}</p>}
                    </div>

                    <div className="rounded-xl overflow-hidden h-40 border border-white/5 relative">
                      <div className="absolute inset-0 bg-surface-container-low/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/40 text-4xl">map</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-on-surface-variant hover:text-on-surface px-6 py-4 rounded-full font-label flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!isStepValid(2)}
                      className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,0,122,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Revisar Dados
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 3: Revisão */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <span className="text-primary font-label uppercase tracking-widest block mb-2">Finalização</span>
                    <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4">Sincronizar Astros</h1>
                    <p className="text-on-surface-variant text-lg">
                      Tudo pronto para processar seu mapa natal. Confirme as coordenadas celestiais abaixo.
                    </p>
                  </div>

                  <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-outline font-label text-xs">HORÁRIO</span>
                      <span className="text-secondary font-label text-sm">{formData.horario_nascimento || '--:--'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-outline font-label text-xs">DATA</span>
                      <span className="text-secondary font-label text-sm">{formData.data_nascimento || '--/--/----'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-outline font-label text-xs">LOCALIZAÇÃO</span>
                      <span className="text-secondary font-label text-sm">{formData.local_nascimento || 'Não definida'}</span>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    {erroEnvio && <p className="text-sm text-error text-center" role="alert">{erroEnvio}</p>}
                    <button
                      type="submit"
                      className="w-full bg-primary text-on-primary py-5 rounded-full font-headline flex items-center justify-center gap-4 transition-all uppercase tracking-widest text-lg hover:shadow-[0_0_30px_rgba(255,0,122,0.4)] active:scale-[0.98]"
                    >
                      Calcular Meu Mapa
                      <span className="material-symbols-outlined">explore</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full text-outline hover:text-on-surface py-2 text-center font-label text-sm transition-colors"
                    >
                      Corrigir informações
                    </button>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-xs text-outline max-w-xs mx-auto">
                      Ao clicar em calcular, nosso motor astronômico processará milhões de dados efemérides para gerar sua posição planetária exata.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Ancoragem visual */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-surface-container-low/40 border border-white/5">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs">
                  +4k
                </div>
              </div>
              <p className="text-xs text-outline text-left">
                Junte-se a <span className="text-secondary">4.219 observadores</span><br />que descobriram sua rota hoje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
