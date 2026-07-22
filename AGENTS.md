# ORBIS

Protótipo Flask para criação de mapa astral, horóscopo personalizado e chat
temático. Os templates atuais ficam em `frontend/templates`.

## Tecnologias a serem utilizadas
    - Agno (agentes)
    - OpenRouter (API para modelos dos agentes)
    - Python (backend)
    - Flask (backend)
    - Pyssiweph (cálculos astrológicos)
    - React.js (Frontend)
    - Vite.js (Frontend)
    - Tailwind CSS (Frontend)
    - Vitest (testes)
    - Pytest (testes)
    - SVG (desennho da mandala)
    - Mysql (banco relacional)
    - JSON (parte NoSQL do banco de dados será armazenada em arquivos JSON)

## Forma de Trabalho
- Antes de editar arquivos, apresente um plano curto.
- Liste os arquivos que pretende criar ou modificar.
- Faça mudanças pequenas e verificáveis.
- Peça confirmação antes de mudanças grandes, destrutivas ou de arquitetura.
- Nunca execute comandos destrutivos, como apagar banco ou diretórios, sem confirmação explícita.
- Ao terminar, explique as mudanças e indique como testar localmente.

## Executar localmente
Com o ambiente virtual ativado:

```bash
python run.py
```
A aplicação estará disponível em `http://127.0.0.1:5000`.

## Rotas do MVP
| Método | Rota | Finalidade |
|---|---|---|
| GET | `/` | Redireciona para a tela de acesso |
| GET | `/acesso` | Login e cadastro |
| GET | `/dashboard` | Dashboard sem mapas |
| GET | `/mapas/novo` | Formulário de criação do mapa |
| POST | `/mapas` | Recebe os dados de nascimento |
| GET | `/mapas/principal` | Exibe o mapa principal |
| GET | `/mapas/<id>` | Exibe um mapa específico |
| GET | `/mapas/principal/interpretacoes` | Interpretações planetárias |
| GET | `/horoscopo` | Horóscopo personalizado |
| GET | `/chat` | Chat astral |
| POST | `/chat/mensagens` | Recebe uma mensagem do chat |

As rotas de escrita validam os campos de entrada, mas retornam `501` enquanto
autenticação, SQLite, cálculo do mapa e agentes de IA não estiverem conectados.
