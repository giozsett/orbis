# ORBIS

Aplicação Flask + React para cálculo de mapa natal, interpretações, horóscopo
personalizado e chat astral.

## Executar localmente

Com o ambiente virtual Python ativado:

```bash
cd frontend
npm install
npm run build
cd ..
python run.py
```

A aplicação completa fica disponível em `http://127.0.0.1:5000`. Para trabalhar
no frontend com recarga automática, execute `npm run dev` em `frontend/`; o Vite
encaminha as chamadas de API para o Flask.

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
