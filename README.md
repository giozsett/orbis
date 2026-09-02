![CI](https://github.com/USUARIO/REPOSITORIO/actions/workflows/ci.yml/badge.svg)

# ORBIS

Aplicação Flask + React para cálculo de mapa natal, interpretações, horóscopo
personalizado e chat astral.

## Executar localmente

O projeto possui dois servidores:

- Flask executa o backend em `http://127.0.0.1:5000`.
- Vite executa o frontend de desenvolvimento em `http://localhost:5173`.

Executar apenas `python run.py` **não inicia o Vite**. Nesse caso, o Flask tenta
servir o frontend que já estiver compilado em `frontend/dist`.

### Desenvolvimento (recomendado)

Use dois terminais abertos ao mesmo tempo.

No primeiro terminal, na raiz do projeto, ative o ambiente virtual e inicie o
backend:

```powershell
.\.venv\Scripts\Activate.ps1
python run.py
```

No segundo terminal, inicie o frontend:

```powershell
cd frontend
npm install
npm run dev
```

O `npm install` só precisa ser executado na primeira vez ou quando o
`package.json` mudar. Depois, normalmente basta executar `npm run dev`.

Abra a aplicação em `http://localhost:5173`. O Vite encaminha as chamadas do
frontend para o Flask em `http://127.0.0.1:5000`.

### Aplicação integrada pelo Flask

Para usar somente um terminal, primeiro compile o frontend:

```powershell
cd frontend
npm install
npm run build
cd ..
.\.venv\Scripts\Activate.ps1
python run.py
```

Depois, abra `http://127.0.0.1:5000`. Sempre que alterar o frontend, execute
`npm run build` novamente para atualizar `frontend/dist`.

Se `python run.py` mostrar uma página de erro ou não carregar o React, o bundle
provavelmente ainda não foi criado ou está desatualizado. Execute:

```powershell
cd frontend
npm run build
```

## Configuração

O `.env` precisa apenas da credencial do OpenRouter:

```dotenv
OPENROUTER_API_KEY=sua-chave
```

Os modelos gratuitos e fallbacks ficam versionados em
`backend/data/modelos_openrouter.json`.

## Testes

```bash
python -m pytest -q
cd frontend && npm run build
```

Os dados internacionais são derivados do GeoNames e podem ser atualizados com
`scripts/gerar_cidades_mundo.py`; consulte `backend/data/README_LOCALIZACOES.md`.
