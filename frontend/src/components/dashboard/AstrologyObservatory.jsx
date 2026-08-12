import { useState } from 'react'

const SIGNOS = [
  ['Áries', '♈', 'Fogo', 'iniciativa e coragem'], ['Touro', '♉', 'Terra', 'constância e valores'],
  ['Gêmeos', '♊', 'Ar', 'curiosidade e troca'], ['Câncer', '♋', 'Água', 'afeto e proteção'],
  ['Leão', '♌', 'Fogo', 'expressão e vitalidade'], ['Virgem', '♍', 'Terra', 'análise e aprimoramento'],
  ['Libra', '♎', 'Ar', 'equilíbrio e relações'], ['Escorpião', '♏', 'Água', 'intensidade e transformação'],
  ['Sagitário', '♐', 'Fogo', 'sentido e expansão'], ['Capricórnio', '♑', 'Terra', 'estrutura e realização'],
  ['Aquário', '♒', 'Ar', 'inovação e coletividade'], ['Peixes', '♓', 'Água', 'sensibilidade e imaginação'],
]

const PLANETAS = [
  ['☉', 'Sol', 'Identidade, propósito e força vital.'], ['☽', 'Lua', 'Emoções, hábitos e necessidades íntimas.'],
  ['☿', 'Mercúrio', 'Pensamento, linguagem e aprendizado.'], ['♀', 'Vênus', 'Afetos, valores, prazer e vínculos.'],
  ['♂', 'Marte', 'Desejo, ação, coragem e impulso.'], ['♃', 'Júpiter', 'Expansão, fé, sentido e oportunidades.'],
  ['♄', 'Saturno', 'Limites, tempo, disciplina e maturidade.'], ['♅', 'Urano', 'Liberdade, rupturas e originalidade.'],
  ['♆', 'Netuno', 'Imaginação, espiritualidade e dissolução.'], ['♇', 'Plutão', 'Poder, crises e transformação profunda.'],
]

const CASAS = ['Identidade e presença', 'Recursos e valores', 'Comunicação e entorno', 'Raízes e vida privada', 'Criatividade e prazer', 'Rotina e cuidado', 'Parcerias e encontros', 'Intimidade e renascimento', 'Crenças e horizontes', 'Vocação e imagem pública', 'Amizades e futuro', 'Inconsciente e recolhimento']

const DIGNIDADES = [
  ['Domicílio', 'O planeta está no signo que rege e se expressa com familiaridade.'],
  ['Exaltação', 'Suas qualidades encontram um terreno especialmente favorável.'],
  ['Detrimento', 'A expressão pede adaptação por ocorrer no signo oposto ao domicílio.'],
  ['Queda', 'O planeta atua fora de sua zona de conforto e exige consciência.'],
]

const TABS = [['signos', 'Signos', 'brightness_7'], ['planetas', 'Planetas', 'planet'], ['casas', 'Casas', 'home_work'], ['dignidades', 'Dignidades', 'stars']]

export default function AstrologyObservatory() {
  const [activeTab, setActiveTab] = useState('signos')
  return (
    <section className="observatory-section relative mt-16 overflow-hidden rounded-[2rem] border border-primary/10 px-5 py-12 md:px-10 md:py-16" aria-labelledby="observatory-title">
      <div className="observatory-nebula pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="observatory-orbit pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full" aria-hidden="true"><span className="observatory-moon" /></div>
      <header className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="font-label text-xs uppercase tracking-[0.32em] text-primary">Biblioteca celeste</span>
        <h2 id="observatory-title" className="mt-4 font-headline text-4xl text-on-surface md:text-5xl">Aprenda a ler o céu</h2>
        <p className="mt-4 text-base leading-relaxed text-on-surface-variant/80 md:text-lg">Um mapa astral combina personagens, cenários e modos de expressão. Explore os fundamentos e descubra como cada camada participa dessa linguagem.</p>
      </header>
      <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Fundamentos da astrologia">
        {TABS.map(([id, label, icon]) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} aria-controls={`panel-${id}`} id={`tab-${id}`} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 rounded-full border px-4 py-2.5 font-label text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === id ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_22px_rgba(255,177,195,0.12)]' : 'border-white/10 bg-surface-container/40 text-outline hover:border-primary/30 hover:text-on-surface'}`}><span className="material-symbols-outlined text-lg">{icon}</span>{label}</button>)}
      </div>
      <div className="relative z-10 mt-8 min-h-[24rem]" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'signos' && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{SIGNOS.map(([nome, simbolo, elemento, resumo], index) => <article key={nome} className="observatory-card group rounded-2xl p-4" style={{ '--reveal-delay': `${index * 45}ms` }}><div className="flex items-center gap-3"><span className="text-3xl text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{simbolo}</span><div><h3 className="font-headline text-lg">{nome}</h3><p className="font-label text-[10px] uppercase tracking-widest text-tertiary">{elemento}</p></div></div><p className="mt-3 text-sm text-on-surface-variant/75">{resumo}</p></article>)}</div>}
        {activeTab === 'planetas' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{PLANETAS.map(([simbolo, nome, resumo], index) => <article key={nome} className="observatory-card rounded-2xl p-5 text-center" style={{ '--reveal-delay': `${index * 55}ms` }}><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-2xl text-secondary">{simbolo}</span><h3 className="mt-3 font-headline text-xl">{nome}</h3><p className="mt-2 text-sm leading-relaxed text-on-surface-variant/75">{resumo}</p></article>)}</div>}
        {activeTab === 'casas' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CASAS.map((resumo, index) => <article key={resumo} className="observatory-card flex items-center gap-4 rounded-2xl p-4" style={{ '--reveal-delay': `${index * 45}ms` }}><span className="font-headline text-3xl text-tertiary/70">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-label text-xs uppercase tracking-widest text-primary">Casa {index + 1}</h3><p className="mt-1 text-sm text-on-surface-variant/80">{resumo}</p></div></article>)}</div>}
        {activeTab === 'dignidades' && <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">{DIGNIDADES.map(([nome, resumo], index) => <article key={nome} className="observatory-card rounded-2xl p-6" style={{ '--reveal-delay': `${index * 80}ms` }}><div className="flex items-center gap-3"><span className="material-symbols-outlined text-tertiary">auto_awesome</span><h3 className="font-headline text-2xl">{nome}</h3></div><p className="mt-3 leading-relaxed text-on-surface-variant/80">{resumo}</p></article>)}<p className="mt-2 text-center text-sm italic text-outline md:col-span-2">Dignidade não define um planeta como “bom” ou “ruim”; descreve as condições em que sua função busca se expressar.</p></div>}
      </div>
    </section>
  )
}
