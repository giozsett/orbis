import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MatrizDestino, { rotuloPonto } from './MatrizDestino'

const pontos = {
  A: 15, B: 8, C: 19, D: 6, E: 12, F: 5, G: 9, H: 7, I: 21,
  A1: 6, A2: 9, A3: 21, B1: 10, B2: 20, B3: 5, C1: 5, C2: 4, D1: 6, D2: 18,
  F1: 22, F2: 17, G1: 3, G2: 21, H1: 8, H2: 19, I1: 9, I2: 6, X: 22, dinheiro: 8, amor: 4,
}
const idades = [{ idade: 0, arcano: 15, vertice: 'A' }, { idade: 1.25, arcano: 5, vertice: false }]

describe('MatrizDestino', () => {
  it('desenha todos os pontos com rótulo acessível', () => {
    const html = renderToStaticMarkup(<MatrizDestino matriz={{ pontos, idades }} catalogo={{ 12: { nome: 'O Enforcado' } }} animated={false} />)
    expect(html).toContain('Zona de conforto: arcano 12, O Enforcado')
    expect(html).toContain('Canal do dinheiro: arcano 8')
    expect(html.match(/role="button"/g)).toHaveLength(Object.keys(pontos).length)
    expect(html).toContain('0 anos')
  })

  it('nomeia pontos internos e do coração', () => {
    expect(rotuloPonto('A2')).toBe('Personalidade · interior')
    expect(rotuloPonto('B3')).toBe('Coração · talento')
    expect(rotuloPonto('D')).toBe('Cauda cármica')
  })
})
