from backend.services.openrouter_service import OpenRouterResponseError
from tests.test_chat_service import criar_usuario_com_mapa


def autenticar(client, usuario_id):
    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id


def test_chat_exige_autenticacao(client):
    consulta = client.get("/chat", headers={"Accept": "application/json"})
    envio = client.post("/chat/mensagens", json={"mensagem": "Olá"})

    assert consulta.status_code == 401
    assert envio.status_code == 401


def test_chat_exige_mapa_principal(client, app):
    usuario_id = criar_usuario_com_mapa(app, com_mapa=False)
    autenticar(client, usuario_id)

    resposta = client.get("/chat", headers={"Accept": "application/json"})

    assert resposta.status_code == 404
    assert resposta.get_json()["codigo"] == "mapa_principal_ausente"


def test_chat_responde_e_bloqueia_quarta_pergunta(client, app, monkeypatch):
    usuario_id = criar_usuario_com_mapa(app)
    autenticar(client, usuario_id)
    monkeypatch.setattr(
        "backend.services.chat_service.completar",
        lambda *_args, **_kwargs: "Uma resposta do seu mapa principal.",
    )
    app.config["OPENROUTER_CHAT_MODEL"] = "modelo/chat:free"

    consulta = client.get("/chat", headers={"Accept": "application/json"})
    respostas = [
        client.post("/chat/mensagens", json={"mensagem": f"Pergunta {numero}"})
        for numero in range(1, 5)
    ]

    assert consulta.status_code == 200
    assert len(consulta.get_json()["sugestoes"]) == 10
    assert [item.status_code for item in respostas] == [200, 200, 200, 429]
    assert respostas[2].get_json()["limite"]["restantes"] == 0
    assert respostas[3].get_json()["codigo"] == "limite_chat_atingido"


def test_chat_valida_pergunta_e_trata_falha_do_openrouter(client, app, monkeypatch):
    usuario_id = criar_usuario_com_mapa(app)
    autenticar(client, usuario_id)

    vazia = client.post("/chat/mensagens", json={"mensagem": "  "})

    def falhar(*_args, **_kwargs):
        raise OpenRouterResponseError("indisponível")

    monkeypatch.setattr("backend.services.chat_service.completar", falhar)
    falha = client.post("/chat/mensagens", json={"mensagem": "Pergunta válida"})

    assert vazia.status_code == 400
    assert falha.status_code == 502
