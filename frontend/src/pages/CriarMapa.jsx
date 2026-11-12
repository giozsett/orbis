import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'

const NOMES_PAISES = typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['pt-BR'], { type: 'region' })
  : null

function nomeDoPais(pais) {
  return NOMES_PAISES?.of(pais.codigo) || pais.nome
}

export default function CriarMapa() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    horario_nascimento: '',
    local_nascimento: '',
    pais_codigo: 'BR',
    cidade_id: '',
    cidade_ibge: '',
  })
  const [paises, setPaises] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [buscandoCidade, setBuscandoCidade] = useState(false)
  const [erroCidade, setErroCidade] = useState('')
  const [erroEnvio, setErroEnvio] = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    fetch('/api/localizacoes/paises')
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error()
        setPaises(data.paises || [])
      })
      .catch(() => setErroCidade('Não foi possível carregar a lista de países.'))
  }, [])

  useEffect(() => {
    const consulta = formData.local_nascimento.trim()
    if (formData.cidade_id || consulta.length < 2) {
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
          `/api/localizacoes/cidades?q=${encodeURIComponent(consulta)}&pais=${formData.pais_codigo}&limite=10`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Falha ao buscar cidades.')
        const data = await response.json()
        setSugestoes(data.cidades || [])
        if (!data.cidades?.length) setErroCidade('Nenhuma cidade encontrada nesse país.')
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
  }, [formData.local_nascimento, formData.cidade_id, formData.pais_codigo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.cidade_id) {
      setErroCidade('Selecione uma cidade da lista de sugestões.')
      setStep(2)
      return
    }

    setErroEnvio('')
    try {
      const payload = { ...formData }
      if (payload.pais_codigo !== 'BR') delete payload.cidade_ibge
      const response = await fetch('/mapas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        return Boolean(formData.cidade_id)
      default:
        return false
    }
  }

  const alterarCidade = (value) => {
    setFormData(prev => ({ ...prev, local_nascimento: value, cidade_id: '', cidade_ibge: '' }))
    setErroCidade('')
  }

  const selecionarCidade = (cidade) => {
    setFormData(prev => ({
      ...prev,
      local_nascimento: [cidade.nome, cidade.subdivisao, cidade.pais_codigo === 'BR' ? null : cidade.pais_nome].filter(Boolean).join(', '),
      cidade_id: cidade.id,
      cidade_ibge: cidade.pais_codigo === 'BR' ? cidade.ibge : '',
    }))
    setSugestoes([])
    setErroCidade('')
  }

  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="flex items-start justify-center px-4 pb-8 pt-6 md:min-h-dvh md:items-center md:pb-12 md:pt-20">
        <div className="w-full max-w-2xl">
          {/* Indicador de etapas */}
          <div className="flex justify-between items-center mb-6 px-2 md:mb-12">
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
                        s < step ? 'bg-primary/40' : 'bg-veu/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 xs:p-6 md:rounded-xl md:p-12 relative overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Etapa 1: Dados temporais */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="mb-6 md:mb-8">
                    <span className="text-primary font-label uppercase tracking-widest block mb-2">Fase 01</span>
                    <h1 className="font-headline text-3xl md:text-5xl text-on-surface mb-3 md:mb-4">Origem Temporal</h1>
                    <p className="text-on-surface-variant md:text-lg">
                      Para alinhar as constelações, precisamos saber exatamente quando sua jornada começou.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 orbis-cascata">
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-label text-sm text-secondary block" htmlFor="nome-mapa">Nome do mapa <span className="text-outline">(opcional)</span></label>
                      <div className="relative">
                        <input
                          id="nome-mapa"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => updateForm('nome', e.target.value)}
                          maxLength={100}
                          placeholder="Ex.: Meu mapa, Ana, Projeto pessoal…"
                          className="w-full bg-surface-container-low border border-veu/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                          label
                        </span>
                      </div>
                      <p className="text-xs text-outline">Ajuda a identificar mapas adicionais na sua coleção.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-label text-sm text-secondary block">Data de Nascimento</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.data_nascimento}
                          onChange={(e) => updateForm('data_nascimento', e.target.value)}
                          className="w-full bg-surface-container-low border border-veu/10 rounded-lg py-4 px-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
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
                          className="w-full bg-surface-container-low border border-veu/10 rounded-lg py-4 px-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
                          required
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                          schedule
                        </span>
                      </div>
                      <p className="text-xs text-outline italic">Use o horário da certidão de nascimento se possível.</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end md:mt-12">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStepValid(1)}
                      className="w-full justify-center bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label flex items-center gap-2 transition-all md:w-auto hover:shadow-[0_0_20px_rgb(var(--c-primary-container)/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="mb-6 md:mb-8">
                    <span className="text-primary font-label uppercase tracking-widest block mb-2">Fase 02</span>
                    <h1 className="font-headline text-3xl md:text-5xl text-on-surface mb-3 md:mb-4">Ponto de Observação</h1>
                    <p className="text-on-surface-variant md:text-lg">
                      O céu muda dependendo de onde você está na Terra. Informe sua localização.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-label text-sm text-secondary block" htmlFor="pais-nascimento">País de Nascimento</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">public</span>
                        <select
                          id="pais-nascimento"
                          value={formData.pais_codigo}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              pais_codigo: e.target.value,
                              local_nascimento: '',
                              cidade_id: '',
                              cidade_ibge: '',
                            }))
                            setSugestoes([])
                            setErroCidade('')
                          }}
                          className="w-full appearance-none bg-surface-container-low border border-veu/10 rounded-lg py-4 pl-12 pr-12 text-on-surface focus:ring-0 focus:border-primary transition-all"
                        >
                          {[...paises].sort((a, b) => nomeDoPais(a).localeCompare(nomeDoPais(b), 'pt-BR')).map(pais => (
                            <option key={pais.codigo} value={pais.codigo}>{nomeDoPais(pais)}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                      </div>
                    </div>

                    <div className="space-y-2 relative">
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
                          className="w-full bg-surface-container-low border border-veu/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:ring-0 focus:border-primary transition-all"
                          required
                        />
                        {buscandoCidade && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-outline">Buscando…</span>
                        )}
                      </div>
                      {sugestoes.length > 0 && (
                        <ul id="sugestoes-cidades" role="listbox" className="absolute z-20 w-full mt-2 glass-panel rounded-lg border border-veu/10 overflow-y-auto max-h-60 shadow-2xl">
                          {sugestoes.map(cidade => (
                            <li key={`${cidade.pais_codigo}-${cidade.id}`} role="option" aria-selected="false">
                              <button
                                type="button"
                                onClick={() => selecionarCidade(cidade)}
                                className="w-full px-4 py-3 hover:bg-veu/5 text-left transition-colors flex justify-between gap-3"
                              >
                                <span>{cidade.nome}, {cidade.subdivisao}</span>
                                <span className="text-xs text-outline">{cidade.pais_nome}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {formData.cidade_id && <p className="text-xs text-secondary">Cidade e fuso horário validados.</p>}
                      {erroCidade && <p className="text-xs text-error" role="alert">{erroCidade}</p>}
                    </div>

                    <div className="rounded-xl overflow-hidden h-40 border border-veu/5 relative">
                      <div className="absolute inset-0 bg-surface-container-low/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/40 text-4xl">map</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-2 md:mt-12 md:flex-row md:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-on-surface-variant hover:text-on-surface px-6 py-4 rounded-full font-label flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!isStepValid(2)}
                      className="w-full justify-center bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label flex items-center gap-2 transition-all md:w-auto hover:shadow-[0_0_20px_rgb(var(--c-primary-container)/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="mb-6 md:mb-8">
                    <span className="text-primary font-label uppercase tracking-widest block mb-2">Finalização</span>
                    <h1 className="font-headline text-3xl md:text-5xl text-on-surface mb-3 md:mb-4">Sincronizar Astros</h1>
                    <p className="text-on-surface-variant md:text-lg">
                      Tudo pronto para processar seu mapa natal. Confirme as coordenadas celestiais abaixo.
                    </p>
                  </div>

                  <div className="space-y-3 bg-veu/5 p-4 md:space-y-4 md:p-6 rounded-xl border border-veu/5">
                    <div className="flex justify-between items-center gap-4 py-2 border-b border-veu/5">
                      <span className="text-outline font-label text-xs">NOME DO MAPA</span>
                      <span className="text-secondary font-label text-sm">{formData.nome || 'Meu mapa natal'}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 py-2 border-b border-veu/5">
                      <span className="text-outline font-label text-xs">HORÁRIO</span>
                      <span className="text-secondary font-label text-sm">{formData.horario_nascimento || '--:--'}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 py-2 border-b border-veu/5">
                      <span className="text-outline font-label text-xs">DATA</span>
                      <span className="text-secondary font-label text-sm">{formData.data_nascimento || '--/--/----'}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 py-2">
                      <span className="text-outline font-label text-xs">LOCALIZAÇÃO</span>
                      <span className="text-right text-secondary font-label text-sm">{formData.local_nascimento || 'Não definida'}</span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4 md:mt-12">
                    {erroEnvio && <p className="text-sm text-error text-center" role="alert">{erroEnvio}</p>}
                    <button
                      type="submit"
                      className="group relative w-full overflow-hidden bg-orbis-cta text-on-cta py-4 md:py-5 rounded-full font-headline flex items-center justify-center gap-3 md:gap-4 transition-all uppercase tracking-wider md:tracking-widest text-base md:text-lg shadow-[var(--sombra-cta)] hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98]"
                    >
                      {/* brilho que atravessa o botão no hover */}
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[350%]" />
                      <span className="relative">Calcular Meu Mapa</span>
                      <span className="material-symbols-outlined relative transition-transform group-hover:translate-x-1">explore</span>
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
          <div className="mt-8 text-center md:mt-16">
            <div className="inline-flex items-center gap-4 px-5 py-3 md:gap-6 md:px-8 md:py-4 rounded-full bg-surface-container-low/40 border border-veu/5">
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
