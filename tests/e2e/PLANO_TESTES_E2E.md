# Plano de Testes End-to-End — ORBIS (IA + Playwright visual)

Trabalho B2 — Testes de Software. Uma IA (Claude Code) controla o navegador através do
**Playwright MCP** (`.mcp.json`), interagindo visualmente com o ORBIS para executar 3 testes
end-to-end. Ao final, a IA grava `tests/e2e/RESULTADO_TESTES_E2E.md`.

## Ambiente

| Item | Valor |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Flask) | http://127.0.0.1:5000 |
| Navegador | Chromium (Playwright), modo visível, viewport 1280x720 |
| Ferramentas | Claude Code + Playwright MCP + OBS Studio (todas gratuitas) |
| Evidências | `tests/e2e/evidencias/` |

**Fora do escopo:** a tela de **Interpretações** (`/interpretacoes`) — depende de API paga (OpenRouter).

## Dados de teste (fictícios)

| Campo | Valor |
|---|---|
| Nome | `Teste E2E` |
| E-mail | `teste.e2e.<AAAAMMDDHHMM>@orbis.test` (gerado na hora, sempre novo) |
| Senha | `Orbis@2026` |
| Senha errada (caso negativo) | `SenhaErrada123` |
| Mapa | nome `Mapa Teste E2E`, data `15/03/1995`, horário `14:30`, Brasil, `São Paulo` |

---

## T1 — Cadastro, logout e login

**Objetivo:** validar o fluxo de autenticação completo, incluindo rejeição de senha incorreta.

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir `http://localhost:5173` | Redireciona para `/login` |
| 2 | Clicar em **Criar conta**, preencher nome, e-mail, senha e confirmação, enviar | Vai para `/dashboard` |
| 3 | Clicar em **Sair** (menu do topo) | Volta para `/login` |
| 4 | Entrar com o e-mail cadastrado e a **senha errada** | Mensagem "E-mail ou senha inválidos." e permanece em `/login` |
| 5 | Entrar com a senha correta | Vai para `/dashboard` |

**Screenshots:** `t1-cadastro.png`, `t1-senha-errada.png`, `t1-dashboard.png`
**Aprovação:** todos os resultados esperados ocorrem.

---

## T2 — Criar mapa natal pelo assistente

**Objetivo:** validar o assistente de 3 fases (`/criar-mapa`) até a exibição do mapa calculado.

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | No dashboard, abrir **Criar novo mapa** | Tela `/criar-mapa`, "Fase 01" |
| 2 | Preencher nome `Mapa Teste E2E`, data `15/03/1995`, horário `14:30`, avançar | Mostra "Fase 02" |
| 3 | País **Brasil**; digitar `São Paulo` na cidade, **sem** clicar em sugestão, tentar avançar | Não avança; pede seleção da lista de sugestões |
| 4 | Clicar na sugestão "São Paulo" (SP) e avançar | Mostra "Finalização" |
| 5 | Conferir o resumo (nome, data, horário, localização) e enviar | `/carregando` e, em seguida, `/mapa` com a roda do mapa e os planetas |
| 6 | Abrir **Meus mapas** | "Mapa Teste E2E" aparece na lista |

**Screenshots:** `t2-fase1.png`, `t2-cidade-sem-selecao.png`, `t2-resumo.png`, `t2-mapa.png`, `t2-meus-mapas.png`
**Aprovação:** mapa criado, exibido e listado; cidade não selecionada é bloqueada.

---

## T3 — Explorar o mapa e as ferramentas

**Objetivo:** validar a navegação pelas telas que usam os dados do mapa e o tratamento de rota inválida.

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Pelo menu, abrir **Dados planetários** (`/mapa/posicoes`) | Tabela com planetas, signos e graus |
| 2 | Abrir **Grade de aspectos** (`/mapa/aspectos`) | Grade/lista de aspectos |
| 3 | Abrir **Casas** (`/mapa/casas`) | 12 casas com signos |
| 4 | Abrir **Retrógrados** (`/mapa/retrogrados`) | Tela carrega com conteúdo |
| 5 | Abrir **Arcanos** e **Matriz do destino** | Telas carregam com conteúdo calculado |
| 6 | Clicar no botão de **tema** | Tema alterna e a página continua legível |
| 7 | Acessar `http://localhost:5173/rota-inexistente` | Página de erro do ORBIS (não uma tela em branco) |

**Screenshots:** `t3-posicoes.png`, `t3-aspectos.png`, `t3-casas.png`, `t3-retrogrados.png`, `t3-arcanos.png`, `t3-matriz.png`, `t3-tema.png`, `t3-404.png`
**Aprovação:** nenhuma tela em branco ou de erro inesperada; rota inválida tratada.

---

## Prompt para a IA (colar no Claude Code durante a gravação)

```text
Use o Playwright MCP para testar visualmente o ORBIS em http://localhost:5173.
Execute os testes T1, T2 e T3 descritos em tests/e2e/PLANO_TESTES_E2E.md, um de cada vez,
narrando em uma frase cada ação antes de executá-la. Interaja como um usuário: use a interface
(cliques e digitação) em vez de chamar a API diretamente. Tire os screenshots indicados e salve
em tests/e2e/evidencias/. Não abra a tela de Interpretações. Se um passo falhar, registre a falha
e continue com o próximo teste.
Ao final, grave tests/e2e/RESULTADO_TESTES_E2E.md contendo: ambiente (data, navegador, URLs);
para cada teste — objetivo, passos executados, resultado esperado x obtido, status
(✅ Passou / ❌ Falhou), evidências (links para os screenshots) e observações/bugs encontrados;
e uma síntese geral (quantos passaram, problemas encontrados, sugestões).
```

## Formato esperado do resultado (`RESULTADO_TESTES_E2E.md`)

```markdown
# Resultado dos Testes E2E — ORBIS
Data: … | Navegador: Chromium (Playwright MCP) | IA: Claude Code

## Resumo
| Teste | Status | Duração |
|---|---|---|
| T1 — Cadastro, logout e login | ✅ Passou | … |

## T1 — …
**Objetivo:** …
**Passos executados:** …
**Esperado x Obtido:** …
**Evidências:** ![](evidencias/t1-cadastro.png)
**Observações:** …

## Síntese geral
…
```
