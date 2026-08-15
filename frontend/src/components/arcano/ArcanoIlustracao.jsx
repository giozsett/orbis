export default function ArcanoIlustracao({ arcano, compacta = false }) {
  if (!arcano) return null
  const [primaria = '#ffb1c3', secundaria = '#b86dfd', fundo = '#101827'] = arcano.cores || []
  const gradiente = `arcano-gradiente-${arcano.numero}`
  return (
    <svg
      viewBox="0 0 280 460"
      role="img"
      aria-label={`Carta ${arcano.numero}, ${arcano.nome}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={gradiente} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor={secundaria} stopOpacity=".55" />
          <stop offset="1" stopColor={fundo} />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="274" height="454" rx="18" fill={fundo} stroke={primaria} strokeWidth="5" />
      <rect x="15" y="15" width="250" height="430" rx="12" fill={`url(#${gradiente})`} stroke={secundaria} strokeOpacity=".65" />
      <circle cx="140" cy="205" r="94" fill="none" stroke={primaria} strokeOpacity=".25" />
      <circle cx="140" cy="205" r="68" fill="none" stroke={primaria} strokeOpacity=".42" strokeDasharray="3 9" />
      {[42, 78, 118, 162, 204, 238].map((x, indice) => (
        <circle key={x} cx={x} cy={78 + (indice % 2) * 245} r={indice % 2 ? 2 : 3} fill={primaria} opacity=".8" />
      ))}
      <text x="140" y="55" textAnchor="middle" fill={primaria} fontFamily="serif" fontSize="19">{arcano.numero}</text>
      <text x="140" y="235" textAnchor="middle" fill={primaria} fontFamily="serif" fontSize={compacta ? '92' : '112'}>{arcano.simbolo}</text>
      <path d="M80 305 Q140 270 200 305 Q140 340 80 305Z" fill="none" stroke={primaria} strokeOpacity=".75" />
      <circle cx="140" cy="305" r="12" fill={secundaria} stroke={primaria} />
      <text x="140" y="406" textAnchor="middle" fill="#f8eff5" fontFamily="serif" fontSize="18" letterSpacing="1">{arcano.nome.toUpperCase()}</text>
      <text x="140" y="428" textAnchor="middle" fill={primaria} fontFamily="sans-serif" fontSize="8" letterSpacing="2">ORBIS · ARCANO PESSOAL</text>
    </svg>
  )
}
