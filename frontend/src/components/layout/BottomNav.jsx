import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BottomSheet from '../ui/BottomSheet'
import BotaoTema from '../ui/BotaoTema'
import { abasMobile, ehRotaMais, ehRotaMapa, encerrarSessao, itensMais } from './navItems'

// Tab bar fixa do mobile (abaixo de lg). Some quando o teclado está aberto (ver Chat).
export default function BottomNav({ onAbrirMapa, comMapa }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [maisAberto, setMaisAberto] = useState(false)
  const [saindo, setSaindo] = useState(false)

  const sair = async () => {
    if (saindo) return
    setSaindo(true)
    await encerrarSessao()
    setSaindo(false)
    navigate('/login', { replace: true })
  }

  const tocarAba = (evento, aba) => {
    // Tocar em "Mapa" estando no mapa abre a folha de detalhes, como a sidebar do desktop
    if (aba.id === 'mapa' && comMapa && ehRotaMapa(location.pathname)) {
      evento.preventDefault()
      onAbrirMapa()
    }
  }

  const classeAba = (ativo) =>
    `flex h-16 flex-1 flex-col items-center justify-center gap-0.5 font-label text-[11px] font-medium transition-colors ${
      ativo ? 'text-primary' : 'text-on-surface-variant/80 active:text-on-surface'
    }`

  const pilula = (ativo) =>
    `material-symbols-outlined flex h-7 w-14 items-center justify-center rounded-full text-[22px] transition-colors ${ativo ? 'bg-primary/15' : ''}`

  const maisAtivo = maisAberto || ehRotaMais(location.pathname)

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="orbis-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-veu/[0.08] bg-surface/85 pb-safe backdrop-blur-[18px] lg:hidden"
      >
        <div className="mx-auto flex max-w-xl">
          {abasMobile.map((aba) => {
            const ativo = aba.match(location.pathname)
            return (
              <Link key={aba.id} to={aba.path} onClick={(e) => tocarAba(e, aba)} aria-current={ativo ? 'page' : undefined} className={classeAba(ativo)}>
                <span className={pilula(ativo)} style={ativo ? { fontVariationSettings: "'FILL' 1" } : undefined}>{aba.icon}</span>
                {aba.label}
              </Link>
            )
          })}
          <button type="button" onClick={() => setMaisAberto(true)} aria-expanded={maisAberto} className={classeAba(maisAtivo)}>
            <span className={pilula(maisAtivo)}>menu</span>
            Mais
          </button>
        </div>
      </nav>

      <BottomSheet aberto={maisAberto} onFechar={() => setMaisAberto(false)} titulo="Mais opções">
        <div className="flex flex-col gap-1">
          {itensMais.map((item) => {
            const ativo = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMaisAberto(false)}
                className={`flex min-h-[52px] items-center gap-4 rounded-2xl px-3 text-[15px] active:bg-veu/10 ${ativo ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}
              >
                <span className={`material-symbols-outlined text-[22px] ${ativo ? '' : 'text-on-surface-variant'}`}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="material-symbols-outlined text-lg text-outline">chevron_right</span>
              </Link>
            )
          })}

          {comMapa && (
            <button
              type="button"
              onClick={() => { setMaisAberto(false); onAbrirMapa() }}
              className="flex min-h-[52px] items-center gap-4 rounded-2xl px-3 text-left text-[15px] text-on-surface active:bg-veu/10"
            >
              <span className="material-symbols-outlined text-[22px] text-on-surface-variant">download</span>
              <span className="flex-1">Detalhes do mapa e PDF</span>
              <span className="material-symbols-outlined text-lg text-outline">chevron_right</span>
            </button>
          )}

          <div className="my-2 h-px bg-veu/5" />
          <BotaoTema comRotulo className="mb-1 w-full !justify-start !border-transparent !bg-transparent !px-3" />
          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="flex min-h-[52px] items-center gap-4 rounded-2xl px-3 text-left text-[15px] text-error active:bg-error/10 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            {saindo ? 'Saindo…' : 'Sair'}
          </button>
          <p className="mt-4 text-center font-marca text-xs tracking-[0.16em] text-outline">ORBIS</p>
        </div>
      </BottomSheet>
    </>
  )
}
