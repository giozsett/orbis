# ARCANOS PESSOAIS
- Em cada mapa astral, e mais no mapa principal, gostaria que tivesse algo temático do arcano pessoal. Sugira, abaixo neste mesmo arquivo como posso fazer isso no projeto.
- O arcano pessoal é baseado nos arcanos maiores do tarot e é calculado com base na data de nascimento.
- Ele é calculado somando os dígitos do dia, mês e ano de nascimento.
- Se o total passar de 22, some os dígitos do resultado novamente até obter um número entre 1 e 22.
POR EXEMPLO:
- 27/05/1984 = 27 + 05 + 1984 = 2016 = 2 + 0 + 1 + 6 = 9 – arcano pessoal 9 
- 15/03/1970 = 15 + 03 + 1970 = 1988 = 1 + 9 + 8 + 8 = 26 = 2 + 6 = 8 – arcano pessoal 8
- Perceba, se o resultado for acima de 22, você soma novamente. Para você encontrar um número com base nos 22 Arcanos Maiores do Tarot. 

- Lista de arcanos
1. o mago
2. a sacerdotisa
3. a imperatriz
4. o imperador
5. o papa
6. os enamorados
7. o carro
8. a força
9. o eremita
10. a roda da fortuna
11. a justiça
12. o enforcado
13. a morte
14. a temperança
15. o diabo
16. a torre
17. a estrela
18. a lua
19. o sol
20. o julgamento
21. o mundo
22. o louco

## Sugestões para implementar no ORBIS

### 1. Regra de cálculo

- Criar no backend um serviço isolado, por exemplo `arcano_pessoal_service.py`, que receba a data de nascimento e devolva um número entre 1 e 22.
- Somar primeiro o dia, o mês e o ano completos. Enquanto o resultado for maior que 22, somar os algarismos do resultado.
- Associar o número final aos dados do arcano em um arquivo JSON. Assim, nomes, textos, cores e símbolos podem ser alterados sem modificar a regra de cálculo.
- Validar a data antes do cálculo e nunca aceitar resultado zero ou uma data inexistente.

Exemplo de lógica em Python:

```python
def calcular_arcano_pessoal(data_nascimento):
    resultado = (
        data_nascimento.day
        + data_nascimento.month
        + data_nascimento.year
    )

    while resultado > 22:
        resultado = sum(int(digito) for digito in str(resultado))

    return resultado
```

### 2. Catálogo dos arcanos

- Criar `backend/data/arcanos_maiores.json` com os 22 arcanos.
- Para cada arcano, armazenar: `numero`, `nome`, `slug`, `palavras_chave`, `resumo`, `potenciais`, `desafios`, `conselho`, `cores`, `simbolo`, `imagem_carta` e `imagem_carta_pdf`.
- Manter o conteúdo interpretativo separado dos dados do mapa natal. O mapa salva o número do arcano calculado; o catálogo fornece a apresentação e os textos.
- Escrever interpretações próprias para evitar dependência de textos protegidos de baralhos ou livros específicos.
- Produzir uma ilustração completa e própria para cada um dos 22 arcanos, no formato vertical de uma carta de tarot. Não usar somente um ícone genérico.
- Manter unidade artística entre as cartas: mesma moldura, proporção, tipografia, acabamento e linguagem cósmica alinhada à identidade do ORBIS, variando personagens, cenário, símbolos e paleta de cada arcano.
- Usar artes originais, licenciadas para o projeto ou em domínio público. Não copiar cartas de baralhos comerciais ou ilustrações protegidas.
- Armazenar as cartas em uma pasta previsível, por exemplo `frontend/public/images/arcanos/`, com nomes como `09-o-eremita.webp` e uma versão de alta resolução para impressão como `09-o-eremita-pdf.png`.

### 3. Persistência e API

- Calcular o arcano no momento em que o mapa astral for criado, usando a mesma data de nascimento já informada pelo usuário.
- Salvar `arcano_pessoal_numero` junto ao mapa natal ou calculá-lo sob demanda. Para o MVP, salvar o número facilita consultas e mantém o resultado estável.
- Incluir no JSON devolvido pelas rotas de mapas um objeto `arcano_pessoal` com número, nome, palavras-chave e apresentação visual.
- Aplicar a funcionalidade a todos os mapas; no mapa marcado como principal, dar maior destaque visual ao arcano.
- Não permitir que o cliente envie ou altere diretamente o número calculado: a fonte da verdade deve ser a data de nascimento validada no backend.

Exemplo de resposta:

```json
{
  "arcano_pessoal": {
    "numero": 9,
    "nome": "O Eremita",
    "slug": "o-eremita",
    "palavras_chave": ["introspecção", "sabedoria", "busca interior"],
    "imagem_carta": "/images/arcanos/09-o-eremita.webp",
    "imagem_carta_pdf": "/images/arcanos/09-o-eremita-pdf.png"
  }
}
```

### 4. Experiência visual no mapa

- Exibir no resumo de cada mapa uma miniatura real da carta, acompanhada do número e do nome do arcano pessoal. O desenho deve continuar reconhecível mesmo em tamanho reduzido.
- Na página do mapa principal, criar um card em destaque chamado **Seu Arcano Pessoal**, mostrando a ilustração completa da carta, uma breve interpretação e um botão **Explorar meu arcano**.
- Usar a paleta do arcano como detalhe temático: brilho, borda, gradiente ou textura discreta. A identidade principal do ORBIS deve continuar consistente e legível.
- Próximo à mandala, apresentar uma versão compacta da própria carta, sem misturá-la aos elementos técnicos do mapa astral nem sugerir que ela faz parte do cálculo astrológico.
- Nas páginas de interpretações e horóscopo, usar o arcano como uma camada complementar, claramente identificada como leitura simbólica do tarot.
- Garantir contraste, alternativa textual para imagens, navegação por teclado e uma opção visual neutra para quem preferir menos efeitos.

#### Animação da carta

- Ao entrar na área visível, a carta pode surgir com uma revelação suave: leve rotação 3D, aumento de escala e passagem de brilho sobre a moldura.
- No `hover` ou foco pelo teclado, aplicar apenas um movimento sutil de inclinação, profundidade e partículas luminosas relacionadas à paleta do arcano.
- Ao abrir os detalhes, permitir uma animação de virar a carta; a frente mostra a ilustração e o verso pode introduzir palavras-chave antes da interpretação completa.
- Implementar as animações preferencialmente com CSS e React, mantendo a imagem da carta como recurso independente. Isso evita transformar cada carta em um vídeo pesado.
- Respeitar `prefers-reduced-motion`: nesse modo, mostrar a carta sem rotação, partículas ou transições longas.
- Carregar miniaturas sob demanda e reservar previamente o espaço da imagem para evitar saltos no layout. Disponibilizar um fallback estático caso a imagem não carregue.

### 5. Página ou painel detalhado

Ao abrir o arcano, apresentar:

- a arte da carta em tamanho maior, com opção de ampliar;
- significado central;
- potenciais e qualidades;
- desafios e pontos de atenção;
- conselho de desenvolvimento pessoal;
- relação simbólica com os principais elementos do mapa natal;
- uma pergunta de reflexão para o usuário.

A relação entre tarot e astrologia pode futuramente ser produzida por um agente de IA, mas o número e o nome do arcano devem sempre vir do cálculo determinístico, nunca do modelo de linguagem.

### 6. Presença do arcano no PDF

- Criar no relatório uma seção chamada **Seu Arcano Pessoal**, preferencialmente após o resumo do mapa natal.
- Inserir a versão estática e de alta resolução da carta, mantendo sua proporção vertical, ao lado do número, nome, palavras-chave e resumo interpretativo.
- Reaproveitar a mesma identidade visual da tela, mas converter brilho, partículas e animações em moldura, fundo e detalhes estáticos apropriados para impressão.
- Não tentar transportar a animação para o PDF comum. A animação pertence à experiência web; o documento deve apresentar um quadro estático da carta com boa qualidade.
- Se for útil, incluir no PDF um QR Code ou link curto com o texto **Veja sua carta animada no ORBIS**, direcionando para a página autenticada do mapa. O PDF não deve expor dados pessoais no endereço.
- Incorporar a imagem no processo de geração do PDF, em vez de depender de uma URL externa que possa estar indisponível. Preparar um fallback com moldura, número e nome caso o arquivo da arte esteja ausente.
- Otimizar a imagem para que continue nítida sem aumentar excessivamente o arquivo: usar a versão de impressão no relatório e a versão WebP otimizada no navegador.
- Adicionar texto alternativo no PDF acessível e verificar que a carta não seja cortada entre páginas.

### 7. Integração futura com agentes

- Fornecer ao agente apenas os dados necessários: arcano, posições astrológicas relevantes e preferências do usuário.
- Criar um prompt específico para combinar os dois sistemas sem apresentar interpretações simbólicas como fatos ou previsões garantidas.
- Manter uma interpretação-base local para que o card funcione mesmo sem OpenRouter ou Agno disponíveis.
- Identificar claramente os textos gerados por IA e aplicar limites de tamanho e filtros de segurança.

### 8. Testes recomendados

- Testar os exemplos informados: `27/05/1984` deve resultar em 9 e `15/03/1970` deve resultar em 8.
- Testar um total já situado entre 1 e 22, um total igual a 22 e um resultado que precise de mais de uma redução.
- Testar datas inválidas e anos bissextos.
- No backend, usar Pytest para a função de cálculo e para a resposta das rotas.
- No frontend, usar Vitest para verificar a miniatura da carta, o card detalhado, o fallback de imagem, o estado sem arcano e a acessibilidade básica.
- Testar que `prefers-reduced-motion` desative os movimentos sem esconder a carta ou seu conteúdo.
- Testar a geração do PDF com a imagem correta, com o fallback e com uma carta de proporção diferente, garantindo que não haja corte ou deformação.

### 9. Ordem de implementação sugerida

1. Definir a direção artística e produzir primeiro uma carta-piloto para validar moldura, legibilidade, animação e impressão.
2. Criar o catálogo JSON, os caminhos das imagens e o serviço determinístico de cálculo.
3. Adicionar testes unitários para a regra.
4. Integrar o resultado à criação, persistência e consulta dos mapas.
5. Criar componentes React reutilizáveis para a miniatura, a carta animada e o painel detalhado.
6. Integrar a versão estática de alta resolução ao relatório PDF e validar a impressão.
7. Após aprovar a carta-piloto, produzir as outras 21 artes mantendo o mesmo sistema visual.
8. Adicionar interpretações combinadas por IA somente depois de o fluxo básico estar estável.

Essa divisão mantém o cálculo simples e testável, transforma a carta em parte importante da identidade visual e permite oferecer animação na interface e uma reprodução estática de qualidade no PDF sem misturar as responsabilidades de cada formato.
