# Plano de implementação — Dia do Horóscopo Maluco

## Objetivo

Adicionar ao ORBIS uma área de conteúdos lúdicos chamada **Dia do Horóscopo
Maluco**. A primeira experiência será **"Qual distro do Linux você seria
baseado no seu signo"**. Neste MVP ela considera **somente o signo solar** do
mapa atualmente selecionado no menu lateral e apresenta um resultado breve,
sem substituir o horóscopo personalizado já existente.

O requisito de seleção é importante: diferentemente de Horóscopo e Chat Astral,
que continuam ligados ao mapa principal, esta área deve reagir ao mapa escolhido
na `Sidebar`, inclusive usando a cor pastel daquele mapa.

## Diagnóstico do código atual

- `frontend/src/App.jsx` concentra as rotas React.
- `frontend/src/components/layout/TopNav.jsx` contém a navegação superior
  principal e também a versão mobile.
- `frontend/src/components/layout/Sidebar.jsx` lista e seleciona os mapas;
  `useMapaSelecionado.js` persiste o ID e a cor em `localStorage` e emite o
  evento de troca.
- As páginas técnicas já consomem esse estado por meio do hook
  `useMapaSelecionado`, por exemplo `PosicoesPlanetarias.jsx` e
  `Asteroides.jsx`.
- `corDoMapa()` fornece a paleta e deve ser a única fonte da cor de destaque
  também para a nova página.
- O backend já expõe cada mapa do usuário em `GET /mapas/<id>`, incluindo
  `dados.planetas`; logo, o MVP pode calcular o resultado no cliente sem criar
  tabela, migração ou chamada a IA.
- Para acesso direto/atualização da URL em produção, uma nova rota React
  também precisa constar em `backend/app/frontend.py` (`ROTAS_SPA`).

## Escopo do primeiro tema

### Fonte de dados e regra

1. A página chama `useMapaSelecionado()` e aguarda o mapa selecionado.
2. Localiza o planeta cujo `nome` é `Sol` em `mapa.dados.planetas`.
3. Usa exclusivamente `sol.signo` como chave em um catálogo local e
   determinístico de doze resultados. A regra deve ser explícita na interface:
   "baseado no seu Sol em [signo]". Ascendente, Lua, casas, aspectos e demais
   posições não participam da regra nesta primeira versão.
4. Caso o mapa não esteja disponível ou não tenha Sol, reutiliza os estados de
   carregamento/erro de `CelestialPageState` e não exibe resultado inventado.

O catálogo deve ficar em um módulo próprio, por exemplo
`frontend/src/data/horoscoposMalucos.js`, com uma entrada para cada signo.
Cada entrada terá pelo menos `signo`, `distro`, `familia`, `descricao`,
`caracteristicas` (3 itens), `cor` e `observacao`. A escolha inicial proposta,
para validação de conteúdo antes do desenvolvimento final, é:

| Signo | Distribuição sugerida |
| --- | --- |
| Áries | Arch Linux |
| Touro | Debian |
| Gêmeos | Fedora |
| Câncer | Linux Mint |
| Leão | Pop!_OS |
| Virgem | NixOS |
| Libra | elementary OS |
| Escorpião | Kali Linux |
| Sagitário | EndeavourOS |
| Capricórnio | Rocky Linux |
| Aquário | openSUSE Tumbleweed |
| Peixes | Ubuntu |

Essas associações são editoriais e de entretenimento; não devem depender de
dados externos nem sugerir que uma distro seja melhor que outra.

### Navegação superior temática

Criar no `TopNav` um segundo nível de navegação para a área de horóscopos
variados, exibido apenas quando a rota ativa pertencer a esse grupo.

- Rota inicial: `/horoscopos-malucos`.
- O segundo menu deve conter itens de tema com ícone e rótulo; inicialmente,
  somente **Distros Linux**.
- O item Linux precisa de um ícone de pinguim/Tux. Material Symbols não oferece
  um Tux apropriado, então criar um pequeno componente SVG próprio, por exemplo
  `frontend/src/components/icons/LinuxTuxIcon.jsx`, com `aria-hidden` quando
  acompanhado de texto e `title` quando usado isoladamente. Não baixar ou
  embutir um logo de terceiros sem verificar licença.
- Em desktop, posicionar esse menu abaixo da barra fixa atual, sem sobrepor o
  conteúdo. Em mobile, incluir os mesmos destinos no painel de navegação e/ou
  como faixa rolável abaixo do cabeçalho; manter a área de toque de 44 px.
- A `TopNav` deve reconhecer o grupo por prefixo de rota, em vez de comparações
  exatas, para comportar futuros temas sem novas regras de estado.

## Layout da página

Criar `frontend/src/pages/HoroscoposMalucos.jsx`, envolvida por
`<Layout showFooter={false}>`, para manter o cabeçalho, a `Sidebar` e a mesma
largura (`lg:ml-80`) das páginas principais. A página terá uma apresentação
enxuta, inspirada no componente de Arcano Pessoal já mostrado em
`MapaPrincipal.jsx`: uma carta de descoberta visualmente marcante, seguida de
um breve aprofundamento próprio da funcionalidade — sem transformar o resultado
em um relatório longo.

Estrutura proposta:

1. **Hero temático curto:** eyebrow "Dia do Horóscopo Maluco", título da
   experiência Linux, Tux em destaque, nome do mapa e o signo solar usado.
2. **Carta de descoberta:** inspirada na hierarquia do Arcano Pessoal: nome
   grande da distro, família/base, uma descrição curta e até três chips de
   características. Esta é a informação central da tela. A borda, brilho,
   ícone e CTA usam a cor corrente do mapa (`cor` obtida de
   `lerCorMapaSelecionado`/estado reativo), mantendo o fundo escuro e a
   legibilidade padrão do ORBIS.
3. **Bloco breve "Por que essa distro?":** um único parágrafo explica a
   associação simbólica entre signo e resultado, deixando claro o tom de
   brincadeira.
4. **Troca de mapa:** texto auxiliar orienta o usuário a abrir "Meus mapas" na
   barra lateral; a página atualiza automaticamente após a seleção, sem
   navegação adicional.
5. **Aviso editorial:** conteúdo lúdico, sem relação com recomendação técnica
   de segurança, suporte ou escolha real de sistema operacional.

Evitar alterar as cores globais do Tailwind. Aplicar a cor específica como
`style` local (borda, fundo translúcido e sombra), no mesmo padrão já usado em
`Sidebar` e `TechnicalHeader`. Isso evita o efeito de a paleta voltar à cor
primária ao trocar de tela.

### Movimento e resposta às interações

Usar as animações já disponíveis em `frontend/src/styles/animations.css` e os
padrões visuais de `GlassCard`, sem adicionar efeitos chamativos ou movimento
contínuo desnecessário:

- entrada curta e escalonada do hero e da carta (`animate-fade-in-up`), com
  duração aproximada entre 250 e 400 ms;
- Tux com flutuação muito sutil e lenta, respeitando a linguagem já empregada
  nos ícones celestes (`animate-float-slow`);
- hover de carta, chips, botões e itens do menu com transição de cor, borda,
  sombra e escala máxima de 1.02, para que cliques e hovers não pareçam secos;
- transição suave quando a pessoa troca o mapa: atualizar conteúdo e cor sem
  animação de saída/entrada agressiva e sem piscar para a cor primária;
- respeitar `prefers-reduced-motion`, reduzindo ou removendo flutuação,
  translações e animações não essenciais para usuários que solicitarem menos
  movimento.

## Alterações por arquivo

| Arquivo | Alteração |
| --- | --- |
| `frontend/src/App.jsx` | Importar a página e registrar `/horoscopos-malucos`. |
| `frontend/src/components/layout/TopNav.jsx` | Adicionar o grupo/segundo menu temático, item Linux, estado ativo por prefixo e alternativa mobile acessível. |
| `frontend/src/pages/HoroscoposMalucos.jsx` | Nova página que obtém o mapa selecionado, resolve o signo solar e renderiza todos os estados e resultado. |
| `frontend/src/data/horoscoposMalucos.js` | Novo catálogo de mapeamento signo → distro e textos editoriais. |
| `frontend/src/components/icons/LinuxTuxIcon.jsx` | Novo SVG de pinguim, limitado ao uso visual desta área. |
| `frontend/src/hooks/useMapaSelecionado.js` | Somente se necessário: expor a cor de forma reativa junto do mapa; preservar a API existente e o evento atual. |
| `backend/app/frontend.py` | Adicionar `/horoscopos-malucos` a `ROTAS_SPA` para recarregamento direto funcionar no Flask. |
| `frontend/src/pages/HoroscoposMalucos.test.jsx` | Novo teste Vitest da regra de resultado e dos estados principais, quando a configuração de testes React estiver disponível. |

Não é prevista alteração em banco de dados, modelos, serviços de IA ou rotas de
API no MVP. Uma API somente será necessária se os temas passarem a ter conteúdo
dinâmico, histórico, votação ou geração por IA.

## Sequência de implementação

1. Criar o catálogo completo e revisar os textos/associações editoriais.
2. Criar o SVG Tux e a página estática usando um mapa fixture para validar o
   layout enxuto, inspirado no Arcano Pessoal, e sua responsividade.
3. Integrar `useMapaSelecionado`, o signo solar e os estados de carregamento,
   ausência de mapa e dado incompleto.
4. Registrar a rota no React e no fallback SPA Flask.
5. Implementar o sub-menu em `TopNav`, garantindo que não apareça nas demais
   áreas e que o mobile tenha acesso equivalente.
6. Ajustar detalhes visuais e as microanimações com cada uma das cores de
   `CORES_MAPAS`; validar contraste, ausência de piscadas e preferência de
   movimento reduzido.
7. Adicionar testes e executar build/testes.

## Critérios de aceite

- A navegação superior permite chegar a "Dia do Horóscopo Maluco" e identifica
  o tema Linux pelo pinguim.
- A URL `/horoscopos-malucos` funciona ao navegar e ao atualizar a página tanto
  no Vite quanto no Flask com o bundle compilado.
- O resultado muda ao selecionar outro mapa na `Sidebar`, sem recarregar a
  página, e usa somente o Sol daquele mapa.
- O destaque visual acompanha a cor do mapa selecionado, sem alterar a paleta
  global ou piscar ao abrir páginas técnicas.
- A carta de resultado é breve e tem a mesma sensação de descoberta do Arcano
  Pessoal, mantendo uma página própria para o tema.
- Entradas, hovers e cliques têm transições discretas e funcionais; usuários
  com `prefers-reduced-motion` não recebem animações supérfluas.
- Não há resultado quando não existe mapa ou Sol válido; o usuário recebe uma
  orientação clara.
- O layout preserva `TopNav`, `Sidebar`, responsividade e os componentes visuais
  de vidro já adotados no ORBIS.
- A página comunica que é entretenimento e não uma recomendação de distribuição
  Linux.

## Verificação

1. Criar ao menos dois mapas e abrir `/horoscopos-malucos`.
2. Confirmar o resultado do primeiro mapa e selecionar o segundo em "Meus
   mapas" na lateral; verificar nome, signo, distro e cor atualizados.
3. Testar desktop e largura mobile, inclusive foco por teclado, `Escape` e
   labels acessíveis nos menus.
4. Atualizar diretamente `/horoscopos-malucos` com `npm run dev` e após
   `npm run build` + `python run.py`.
5. Executar `cd frontend; npm run build` e os testes Vitest que forem
   adicionados; executar também `python -m pytest -q` para confirmar que a
   inclusão da rota SPA não afetou o backend.

## Evolução posterior (fora do MVP)

- Acrescentar Pokémon, filmes, instrumentos ou outros temas ao catálogo e ao
  segundo menu, preservando o mesmo contrato de dados.
- Dar a cada tema uma rota própria (`/horoscopos-malucos/linux`, por exemplo)
  quando houver mais de uma experiência, mantendo a rota inicial como redirect
  ou página de índice.
- Permitir compartilhar a carta do resultado como imagem, mediante definição de
  identidade visual e tratamento de acessibilidade.
