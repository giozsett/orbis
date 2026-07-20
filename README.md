# ORBIS

Protótipo Flask para criação de mapa astral, horóscopo personalizado e chat
temático. Os templates atuais ficam em `frontend/templates` e são renderizados
pelo Jinja/Flask.

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
