# ORBIS — Plano de Implementação (MVP)

> Documento de trabalho para guiar a implementação do protótipo ORBIS.
> Baseado no código atual do repositório e nas diretrizes do `AGENTS.md`.

## 1. Visão geral

O ORBIS é um protótipo Flask para criação de **mapa astral**, **horóscopo
personalizado** e **chat temático** (astral). O backend é Python/Flask, o
frontend é React + Vite + Tailwind CSS, e os templates HTML atuais em
`frontend/templates` servem de referência visual/funcional até a migração
completa para o app React.

O backend já está esboçado com rotas funcionais de navegação e formulários,
mas as **rotas de escrita retornam `501`** enquanto os serviços de cálculo,
IA e persistência não forem conectados.

### Objetivos do plano

1. Conectar os stubs de serviço (`backend/services/*`) às rotas que retornam `501`.
2. Implementar o cálculo do mapa astral com `pyswisseph`.
3. Implementar a **localização** do mapa astral:
   - arquivo JSON com **todas as cidades do Brasil**;
   - arquivo JSON com **todos os fusos horários do mundo**;
   - o cálculo inicia **apenas com cidades do Brasil**;
   - posteriormente, os demais países entram no JSON para ampliar o cálculo.
4. Conectar interpretações planetárias e chat via **Agno + OpenRouter**.
5. Persistir dados no **SQLite** (`orbis.db`) usando os modelos existentes.
6. Cobrir com testes **Pytest** (backend) e **Vitest** (frontend).

## 2. Arquitetura e fluxo de dados

```
┌──────────────────────┐      ┌────────────────────────────────────────┐
│  Frontend (React)    │      │  Backend (Flask)                       │
│  Vite + Tailwind     │ HTTP │                                        │
│                      │◄────►│  Blueprints: pages, auth, charts,      │
│  templates/ HTML     │ JSON │  horoscopo, chat                       │
│  (referência atual)  │      │                                        │
└──────────────────────┘      │  Services (stubs a implementar):       │
                              │  mapa_natal, chat, openrouter,         │
                              │  interpretation                        │
                              │                                        │
                              │  Dados: SQLite (orbis.db) + JSON       │
                              │  (cidades do Brasil, fusos do mundo)   │
                              └────────────────────────────────────────┘
```

### Fluxo principal

1. Usuário acessa `/acesso` (login/cadastro via `session` + AJAX).
2. Cria mapa em `/mapas/novo` (formulário → `POST /mapas`).
3. `POST /mapas` valida os campos, resolve a localização (cidade → lat/long/fuso)
   e chama o `MapaNatalService` (pyswisseph) para calcular as posições.
4. Resultado é exibido em `/mapas/<id>` e `/mapas/principal`.
5. Interpretações em `/mapas/principal/interpretacoes` via `interpretation_service`
   (Agno + OpenRouter).
6. Horóscopo personalizado em `/horoscopo` (limites de escopo definidos no plano).
7. Chat astral em `/chat` via `chat_service` (Agno + OpenRouter).

## 3. Modelo de dados (SQLite)

Banco: `orbis.db` (criado automaticamente por `create_app` via `db.create_all()`).
Config: `backend/app/config.py` → `DevelopmentConfig` (`sqlite:///orbis.db`)
e `TestingConfig` (`sqlite:///:memory:`).

| Modelo | Tabela | Campos principais |
|---|---|---|
| `Usuario` | `usuarios` | id, nome, email (unique), senha_hash, criado_em, atualizado_em |
| `MapaNatal` | `mapas_natais` | id, usuario_id FK, nome, data_nascimento, horario_nascimento, **local_nascimento**, **latitude**, **longitude**, dados (JSON), status, horoscopo_dados (JSON), criado_em |
| `Interpretation` | `interpretacoes` | id, mapa_id FK, planeta, signo, casa, grau, dignidade, elemento, estado, cor, interpretacao, criado_em |
| `ChatMensagem` | `chat_mensagens` | id, usuario_id FK (nullable), mapa_id FK (nullable), papel, mensagem, criado_em |

**Nota:** `local_nascimento`, `latitude` e `longitude` no `MapaNatal` são os
campos diretamente afetados pela funcionalidade de localização.

## 4. Localização do mapa astral

### 4.1 Arquivos de dados (JSON)

Novos arquivos, criados sob `backend/data/`:

- `backend/data/cidades_brasil.json`
  - Lista de todas as cidades do Brasil com dados necessários ao cálculo.
  - Formato proposto por registro:
    ```json
    {
      "ibge": "3550308",
      "municipio": "São Paulo",
      "uf": "SP",
      "regiao": "Sudeste",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "fuso_utc": -3,
      "dst": false
    }
    ```
  - Fontes candidatas: IBGE (código, nome, UF), dados de coordenadas oficiais
    das prefeituras/malhas municipais. O seed inicial pode começar com as
    capitais e ser ampliado até cobrir os 5.570 municípios.
- `backend/data/fusos_horarios.json`
  - Todos os fusos horários do mundo (identificador IANA, ex.:
    `America/Sao_Paulo`, `Europe/Lisbon`, `Asia/Tokyo`) com:
    ```json
    {
      "timezone_id": "America/Sao_Paulo",
      "utc_offset_minutes": -180,
      "observes_dst": false
    }
    ```

### 4.2 Escopo por fases

- **Fase 1 (MVP):** cálculo aceita **apenas cidades do Brasil**. O campo
  `local_nascimento` no formulário é validado contra `cidades_brasil.json` e a
  latitude/longitude/fuso são derivados do JSON.
- **Fases futuras:** adicionar os demais países ao JSON de cidades (ou um
  segundo dataset `cidades_mundo.json`) e aos fusos horários, ampliando o
  cálculo para outras localidades. A estrutura do `MapaNatalService` e do
  resolvedor de localização deve ser desenhada para não exigir mudança de
  assinatura quando isso acontecer.

### 4.3 Resolvedor de localização (novo módulo)

Sugestão de arquivo: `backend/services/localizacao_service.py`

```python
def buscar_cidade_brasil(nome: str) -> dict | None: ...
def listar_cidades_brasil(filtro: str | None = None) -> list[dict]: ...
def buscar_fuso_horario(timezone_id: str) -> dict | None: ...
def resolver_localizacao(local_nascimento: str) -> dict | None:
    """Retorna {latitude, longitude, fuso_utc, timezone_id} ou None."""
```

- Carregamento dos JSONs **uma única vez** (cache em módulo) para evitar I/O
  repetido a cada cálculo.
- Validação de entrada: nome da cidade normalizado (sem acentos/caixa),
  fallback para "capital do estado" quando a cidade não for encontrada, e erro
  claro quando não houver correspondência.

## 5. Serviços a implementar

Todos em `backend/services/`, implementados de forma incremental por fase.

### 5.1 `mapa_natal_service.py` — cálculo com pyswisseph

- Assinatura sugerida:
  ```python
  def calcular_mapa_natal(dados: dict) -> dict: ...
  ```
- Entradas: `data_nascimento`, `horario_nascimento`, `latitude`, `longitude`,
  `fuso_utc`.
- Saída: dicionário com as posições dos planetas (signo, grau, casa),
  ascendente, meio do céu (MC) e nodos, no formato consumido pelo frontend.
- Usar `swisseph` (pyswisseph) com:
  - efemérides embutidas do pacote;
  - conversão correta do horário local → UTC (aplicando o fuso, com/ sem DST
    conforme `dst` do JSON de localização);
  - casas no sistema Placidus (ou Whole Sign, conforme decisão) via
    `swisseph.houses`.
- Salvar o resultado no campo `dados` (JSON) do `MapaNatal`.

### 5.2 `interpretation_service.py` — interpretações com Agno

- Recebe o mapa calculado e gera interpretações planetárias.
- Saída esperada alimenta a tabela `Interpretation` (planeta, signo, casa,
  grau, dignidade, elemento, estado, cor, interpretacao).
- As interpretações textuais são geradas via Agno (agente) com modelo
  configurado via OpenRouter.

### 5.3 `openrouter_service.py` — cliente de modelo

- Encapsula a chamada ao OpenRouter (base URL `https://openrouter.ai/api/v1`,
  API key via variável de ambiente `OPENROUTER_API_KEY` no `.env`).
- Funções sugeridas:
  ```python
  def completar(mensagens: list[dict], modelo: str, **kwargs) -> str: ...
  ```
- Deve ser o único ponto de contato com a API para os demais serviços.

### 5.4 `chat_service.py` — chat astral

- Recebe `usuario_id`/`mapa_id` e a mensagem do usuário.
- Persiste a mensagem em `ChatMensagem` (papel `user`).
- Monta o contexto (mapa natal + histórico recente do chat) e chama o agente
  Agno → OpenRouter para a resposta.
- Persiste a resposta (papel `assistant`) e retorna ao frontend.

### 5.5 `horoscopo_service.py` (novo)

- Busca o **mapa principal** do usuário (status concluído) e aplica os limites
  de escopo definidos no plano (ex.: previsões para um período configurável,
  sem promessas de precisão absoluta; tom informativo/entretenimento).
- Usa `openrouter_service` para gerar o texto e salva em
  `horoscopo_dados` (JSON) do `MapaNatal`.
- Calcula com Swiss Ephemeris as posições de trânsito no início, meio e fim do
  ciclo e cruza aspectos com as posições natais antes de montar o prompt.
- Mantém quatro periodicidades: diária, semanal, quinzenal (dias 1–15 e
  16–fim do mês) e mensal. Cada uma possui uma chave de validade própria no
  cache, evitando nova chamada ao OpenRouter durante o mesmo ciclo.
- Exige resposta JSON curta para conselho, resumo, destaque astral e áreas de
  amor, trabalho e bem-estar. O texto é tratado como conteúdo simbólico de
  reflexão, sem previsões deterministas ou aconselhamento profissional.

## 6. Conexão das rotas que retornam 501

| Rota | Serviço a conectar | Observações |
|---|---|---|
| `POST /mapas` | `MapaNatalService` + `LocalizacaoService` + persistir `MapaNatal` | Validar `data_nascimento`, `horario_nascimento`, `local_nascimento`; resolver cidade → lat/long/fuso; retornar redirect ou JSON com o `id` do mapa |
| `GET /mapas/principal` | consultar mapa principal do usuário | hoje serve `home.html`; passar dados do mapa |
| `GET /mapas/principal/interpretacoes` | `InterpretationService` | gerar/persistir interpretações e servir em `interpretacoesPlanetas.html` |
| `POST /horoscopo/gerar` | `HoroscopoService` | buscar mapa principal e gerar previsão |
| `POST /chat/mensagens` | `ChatService` | validar `mensagem`; persistir e responder |

**Autenticação:** as rotas de escrita devem passar a exigir sessão ativa
(`session`) — o padrão já existe no blueprint `auth`.

## 7. Frontend (React + Vite + Tailwind)

- App existente em `frontend/src/` com páginas: Carregando, Chat, CriarMapa,
  Dashboard, Erro, Horoscopo, Interpretacoes, Login, MapaPrincipal.
- Componentes: layout, mandala (SVG), PlanetCard, zodíaco.
- Integrar as rotas do React às rotas do Flask servidas pelo backend
  (o app React é servido como static; ou o Flask expõe API JSON e o React
  consome — decisão a validar em implementação, mantendo os HTMLs atuais
  como fallback).
- Validação de formulário de mapa: ao digitar o local de nascimento, sugerir
  cidades do Brasil a partir de `GET` (endpoint do resolvedor de localização);
  desabilitar envio enquanto o local não for resolvido (fase 1 = Brasil).

## 8. Testes

### Backend (Pytest)
- Configuração: usar `TestingConfig` (`sqlite:///:memory:`).
- Cobertura esperada:
  - resolvedor de localização (cidade encontrada, não encontrada, normalização);
  - cálculo do mapa (datas/horários conhecidos, fuso com/sem DST);
  - rotas `POST /mapas`, `POST /chat/mensagens`, `POST /horoscopo/gerar`
    (sucesso, validação 400, não autenticado);
  - serviços com API mockada (Agno/OpenRouter) — sem chamadas reais.

### Frontend (Vitest)
- Componentes de formulário do mapa (validação e sugestão de cidades).
- Renderização da mandala SVG a partir dos dados do mapa.

## 9. Roadmap faseado

### Fase 0 — Fundações
- [ ] `backend/data/cidades_brasil.json` (seed inicial: capitais; depois os
      5.570 municípios).
- [ ] `backend/data/fusos_horarios.json` (todos os fusos do mundo, IANA).
- [ ] `backend/services/localizacao_service.py` com cache e validação.
- [ ] Testes do resolvedor.

### Fase 1 — Cálculo do mapa (apenas Brasil)
- [ ] `mapa_natal_service.py` com pyswisseph (posições, ascendente, MC, casas).
- [ ] Conectar `POST /mapas` (validação + persistência em `MapaNatal`).
- [ ] Conectar `GET /mapas/principal` e `GET /mapas/<id>`.
- [ ] Sugestão de cidades do Brasil no formulário (frontend).
- [ ] Testes de cálculo e rota.

### Fase 2 — Interpretações e horóscopo
- [x] `openrouter_service.py` (cliente da API, key via `.env`).
- [ ] `interpretation_service.py` (Agno) e conexão de
      `/mapas/principal/interpretacoes`.
- [x] `horoscopo_service.py` e conexão de `POST /horoscopo/gerar`.
- [x] Testes do horóscopo com mocks de API.

### Fase 3 — Chat astral
- [ ] `chat_service.py` (Agno + OpenRouter, com contexto do mapa e histórico).
- [ ] Conectar `POST /chat/mensagens`.
- [ ] Testes com mocks de API.

### Fase 4 — Expansão da localização
- [ ] Adicionar demais países ao dataset de cidades e liberar o cálculo
      para outras localidades.
- [ ] Ampliar testes de fusos horários (incl. DST).

## 10. Como testar localmente

```bash
# backend (ambiente virtual ativado)
python run.py          # http://127.0.0.1:5000
pytest                 # testes do backend

# frontend
cd frontend
npm install
npm run dev            # dev server Vite
npm test               # Vitest
```
