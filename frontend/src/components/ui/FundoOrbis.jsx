// Meteoros cruzando o fundo: [topo, direita, largura, atraso]
const METEOROS = [
  ['10%', '-8%', 'w-40', '1.5s'],
  ['34%', '-14%', 'w-28', '5.8s'],
  ['4%', '28%', 'w-24', '8.4s'],
]

// Céu de fundo: noite estrelada com meteoros no tema escuro, degradê de nascer do sol no claro
// (as cores vêm de styles/tema.css). A aurora "respira" e a faixa da borda cresce e pulsa.
// Sem `faixa`, a borda fica de fora (páginas com sidebar já têm essa coluna).
export default function FundoOrbis({ faixa = true }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-surface">
        <div className="absolute inset-0 origin-top-left bg-orbis-aurora motion-safe:animate-orbis-aurora" />
        <div className="absolute inset-0 bg-orbis-fade" />
        <div className="orbis-estrelas" />
        <div className="orbis-meteoros absolute inset-0">
        {METEOROS.map(([top, right, largura, atraso]) => (
          <div
            key={top + right}
            className={`absolute h-px ${largura} origin-left rounded-full bg-orbis-meteoro opacity-0 motion-safe:animate-orbis-meteoro`}
            style={{ top, right, animationDelay: atraso }}
          />
        ))}
        </div>
      </div>
      {faixa && (
        <div className="pointer-events-none fixed bottom-0 left-0 z-[1] h-[220px] w-1.5 origin-bottom bg-gradient-to-b from-primary-container to-tertiary-container opacity-[.65] motion-safe:animate-orbis-edge" />
      )}
    </>
  )
}
