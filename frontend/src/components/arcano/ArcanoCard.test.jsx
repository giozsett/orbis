import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ArcanoCard from './ArcanoCard'

const arcano = { numero: 9, nome: 'O Eremita', simbolo: '✧', cores: ['#d7c98d'], palavras_chave: ['sabedoria'], resumo: 'Busca interior.' }

describe('ArcanoCard', () => {
  it('renderiza uma miniatura acessível', () => {
    const html = renderToStaticMarkup(<ArcanoCard arcano={arcano} compacta />)
    expect(html).toContain('Arcano pessoal')
    expect(html).toContain('Carta 9, O Eremita')
  })

  it('não renderiza conteúdo no estado sem arcano', () => {
    expect(renderToStaticMarkup(<ArcanoCard arcano={null} />)).toBe('')
  })
})
