import Layout from '../components/layout/Layout'
import { CelestialError, CelestialLoading, TechnicalHeader } from '../components/map/CelestialPageState'
import GlassCard from '../components/ui/GlassCard'
import useMapaSelecionado from '../hooks/useMapaSelecionado'

const TEMAS = ['Identidade e começos', 'Recursos e valores', 'Comunicação e entorno', 'Raízes e intimidade', 'Criatividade e expressão', 'Rotina e aperfeiçoamento', 'Parcerias e acordos', 'Transformação e partilhas', 'Sentido e expansão', 'Vocação e contribuição', 'Grupos e projetos', 'Recolhimento e integração']

export default function Casas() {
  const { mapa, erro } = useMapaSelecionado()
  if (erro) return <CelestialError mensagem={erro} />
  if (!mapa?.dados) return <CelestialLoading texto="Abrindo as doze casas" />

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12 xl:p-16">
        <TechnicalHeader mapa={mapa} eyebrow="Houses" titulo="As Doze Casas" icone="home_pin" descricao="Explore as áreas de experiência do mapa, suas cúspides e os planetas posicionados em cada setor." />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mapa.dados.casas.map((casa, index) => {
            const planetas = mapa.dados.planetas.filter((planeta) => planeta.casa === casa.numero)
            return (
              <GlassCard key={casa.numero} magnetic className="group relative overflow-hidden p-6 animate-fade-in-up" style={{ animationDelay: `${index * 65}ms` }}>
                <span className="absolute -right-2 -top-6 font-headline text-8xl text-primary/[.045] transition-transform group-hover:scale-110">{casa.numero}</span>
                <div className="relative z-10 flex items-start justify-between"><div><p className="font-label text-xs uppercase tracking-widest text-primary">Casa {casa.numero}</p><h2 className="mt-2 font-headline text-xl">{TEMAS[index]}</h2></div><span className="material-symbols-outlined text-3xl text-secondary">home_work</span></div>
                <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[.025] p-4"><div><p className="font-label text-[10px] uppercase text-outline">Cúspide</p><p className="mt-1 text-sm text-secondary">{casa.signo}</p></div><div><p className="font-label text-[10px] uppercase text-outline">Posição</p><p className="mt-1 font-label text-sm">{casa.posicao}</p></div></div>
                <div className="relative z-10 mt-5"><p className="mb-2 font-label text-[10px] uppercase tracking-widest text-outline">Planetas nesta casa</p><div className="flex min-h-7 flex-wrap gap-2">{planetas.length ? planetas.map((planeta) => <span key={planeta.nome} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">{planeta.nome}</span>) : <span className="text-sm italic text-outline">Nenhum planeta natal</span>}</div></div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
