# Implementação do menu lateral do ORBIS

Os cinco destinos técnicos e a exportação abaixo estão conectados ao mapa
principal. As telas reutilizam os dados natais e mantêm funções distintas das
páginas de Mapa Natal, Interpretações, Horóscopo e Chat Astral.

## Dados Planetários (`Planetary Data`)

- **Rota implementada:** `/mapa/posicoes`
- **Finalidade:** tabela técnica das posições do mapa principal.
- **Conteúdo:** planeta, signo, casa, grau, minuto, longitude e movimento
  direto/retrógrado.
- **Dados existentes:** `mapa.dados.planetas`.
- **Diferença para Interpretações:** apresenta coordenadas e filtros, sem textos
  interpretativos extensos.

## Grade de Aspectos (`Aspect Grid`)

- **Rota implementada:** `/mapa/aspectos`
- **Finalidade:** visualizar as relações angulares entre os planetas natais.
- **Conteúdo:** matriz planeta × planeta, tipo do aspecto, orbe e legenda por cor.
- **Dados existentes:** `mapa.dados.aspectos`.
- **Interação sugerida:** clicar em uma célula destaca os dois planetas na
  mandala e abre uma explicação breve.

## Casas (`Houses`)

- **Rota implementada:** `/mapa/casas`
- **Finalidade:** detalhar as doze áreas de vida do mapa natal.
- **Conteúdo:** signo e grau da cúspide, planetas presentes em cada casa e os
  textos determinísticos do catálogo de interpretações.
- **Dados existentes:** `mapa.dados.casas` e o campo `casa` de cada planeta.

## Retrógrados (`Retrogrades`)

- **Rota implementada:** `/mapa/retrogrados`
- **Finalidade:** reunir os planetas natais marcados como retrógrados.
- **Conteúdo:** planeta, signo, casa, posição e uma explicação reflexiva sobre
  internalização ou revisão daquela função simbólica.
- **Dados existentes:** `mapa.dados.planetas[].retrogrado`.
- **Estado vazio:** explicar que nenhum planeta calculado está retrógrado no
  mapa, em vez de mostrar uma tela vazia.

## Asteroides (`Asteroids`)

- **Rota implementada:** `/mapa/asteroides`
- **Conteúdo:** Quíron, Ceres, Palas, Juno e Vesta, com signo, casa, posição,
  movimento e significado simbólico breve.
- **Dados:** calculados pelo Swiss Ephemeris com o arquivo oficial
  `backend/data/ephemeris/seas_18.se1`, que cobre 1800–2399.

## Exportar Efemérides (`Export Ephemeris`)

- **Rota implementada:** `GET /mapas/principal/exportacao?formato=pdf`.
- **Finalidade:** baixar um relatório do mapa principal.
- **Conteúdo:** PDF com dados de nascimento, posições planetárias, casas,
  aspectos e mandala vetorial.
- **Limite:** 15 MB, validado no backend e novamente no frontend antes do download.
- **Cuidados:** exigir autenticação e gerar o arquivo somente para mapas do
  usuário da sessão.

## Ordem concluída de implementação

1. Dados Planetários.
2. Grade de Aspectos.
3. Casas.
4. Retrógrados.
5. Exportação em PDF.
6. Asteroides, com ampliação do cálculo no backend.
