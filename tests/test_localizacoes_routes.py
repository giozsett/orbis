def test_autocomplete_exige_dois_caracteres(client):
    response = client.get("/api/localizacoes/cidades?q=s")
    assert response.status_code == 200
    assert response.get_json() == {"cidades": []}


def test_autocomplete_limita_resultados(client):
    response = client.get("/api/localizacoes/cidades?q=sao&limite=3")
    assert response.status_code == 200
    assert len(response.get_json()["cidades"]) <= 3


def test_detalha_cidade(client):
    response = client.get("/api/localizacoes/cidades/3550308")
    assert response.status_code == 200
    assert response.get_json()["cidade"]["municipio"] == "São Paulo"


def test_criacao_exige_autenticacao(client):
    response = client.post("/mapas", json={})
    assert response.status_code == 401


def test_criacao_rejeita_codigo_nao_selecionado(client):
    with client.session_transaction() as sessao:
        sessao["usuario_id"] = 1
    response = client.post(
        "/mapas",
        json={
            "data_nascimento": "1990-01-01",
            "horario_nascimento": "12:00",
            "local_nascimento": "Cidade digitada",
            "cidade_ibge": "0000000",
        },
    )
    assert response.status_code == 400


def test_criacao_calcula_e_persiste_mapa(client, app):
    from backend.app.database import db
    from backend.models.usuario import Usuario

    with app.app_context():
        usuario = Usuario(nome="Teste", email="teste@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.commit()
        usuario_id = usuario.id

    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id
    response = client.post(
        "/mapas",
        json={
            "data_nascimento": "2018-01-15",
            "horario_nascimento": "12:00",
            "local_nascimento": "São Paulo, SP",
            "cidade_ibge": "3550308",
        },
    )
    assert response.status_code == 201
    payload = response.get_json()
    assert payload["mapa"]["timezone_id"] == "America/Sao_Paulo"
    assert payload["mapa"]["utc_offset_minutos"] == -120
    assert payload["mapa"]["status"] == "concluido"
    assert len(payload["mapa"]["dados"]["planetas"]) == 11

    detalhe = client.get(
        f"/mapas/{payload['id']}",
        headers={"Accept": "application/json"},
    )
    assert detalhe.status_code == 200
    assert detalhe.get_json()["mapa"]["id"] == payload["id"]


def test_usuario_nao_acessa_mapa_de_outro_usuario(client, app):
    from datetime import date, time

    from backend.app.database import db
    from backend.models.mapa_natal import MapaNatal
    from backend.models.usuario import Usuario

    with app.app_context():
        dono = Usuario(nome="Dono", email="dono@orbis.local", senha_hash="hash")
        outro = Usuario(nome="Outro", email="outro@orbis.local", senha_hash="hash")
        db.session.add_all([dono, outro])
        db.session.flush()
        mapa = MapaNatal(
            usuario_id=dono.id,
            data_nascimento=date(1990, 1, 1),
            horario_nascimento=time(12),
            local_nascimento="São Paulo, SP",
            status="concluido",
        )
        db.session.add(mapa)
        db.session.commit()
        mapa_id, outro_id = mapa.id, outro.id

    with client.session_transaction() as sessao:
        sessao["usuario_id"] = outro_id
    assert client.get(
        f"/mapas/{mapa_id}", headers={"Accept": "application/json"}
    ).status_code == 404
