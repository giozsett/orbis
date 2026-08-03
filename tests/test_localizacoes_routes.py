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


def test_listagem_exige_autenticacao(client):
    assert client.get("/mapas").status_code == 401


def test_exclusao_exige_autenticacao(client):
    assert client.delete("/mapas/1").status_code == 401


def test_lista_mapas_do_usuario_e_mantem_o_primeiro_como_principal(client, app):
    from datetime import date, time

    from backend.app.database import db
    from backend.models.mapa_natal import MapaNatal
    from backend.models.usuario import Usuario

    with app.app_context():
        usuario = Usuario(nome="Dono", email="mapas@orbis.local", senha_hash="hash")
        outro = Usuario(nome="Outro", email="fora@orbis.local", senha_hash="hash")
        db.session.add_all([usuario, outro])
        db.session.flush()

        primeiro = MapaNatal(
            usuario_id=usuario.id,
            nome="Meu mapa",
            data_nascimento=date(1990, 1, 1),
            horario_nascimento=time(12),
            local_nascimento="São Paulo, SP",
            dados={
                "planetas": [{"nome": "Sol", "signo": "Capricórnio", "posicao": "10° 00'"}],
                "ascendente": {"signo": "Áries", "posicao": "04° 00'"},
            },
            status="concluido",
        )
        segundo = MapaNatal(
            usuario_id=usuario.id,
            nome="Mapa adicional",
            data_nascimento=date(1995, 5, 5),
            horario_nascimento=time(8, 30),
            local_nascimento="Curitiba, PR",
            dados={},
            status="concluido",
        )
        mapa_de_outro = MapaNatal(
            usuario_id=outro.id,
            data_nascimento=date(2000, 1, 1),
            horario_nascimento=time(10),
            local_nascimento="Recife, PE",
            status="concluido",
        )
        db.session.add_all([primeiro, segundo, mapa_de_outro])
        db.session.commit()
        usuario_id = usuario.id
        primeiro_id = primeiro.id
        segundo_id = segundo.id

    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    response = client.get("/mapas")
    assert response.status_code == 200
    mapas = response.get_json()["mapas"]
    assert [mapa["id"] for mapa in mapas] == [primeiro_id, segundo_id]
    assert mapas[0]["principal"] is True
    assert mapas[1]["principal"] is False
    assert mapas[0]["resumo"]["sol_signo"] == "Capricórnio"

    principal = client.get(
        "/mapas/principal", headers={"Accept": "application/json"}
    )
    assert principal.status_code == 200
    assert principal.get_json()["mapa"]["id"] == primeiro_id


def test_dashboard_nao_exibe_estado_vazio_quando_ha_mapa(client, app):
    from datetime import date, time

    from backend.app.database import db
    from backend.models.mapa_natal import MapaNatal
    from backend.models.usuario import Usuario

    with app.app_context():
        usuario = Usuario(nome="Dono", email="dashboard@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.flush()
        db.session.add(MapaNatal(
            usuario_id=usuario.id,
            data_nascimento=date(1990, 1, 1),
            horario_nascimento=time(12),
            local_nascimento="São Paulo, SP",
            status="concluido",
        ))
        db.session.commit()
        usuario_id = usuario.id

    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    response = client.get("/dashboard")
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/mapas")


def test_soft_delete_protege_principal_e_exclui_apenas_mapa_extra(client, app):
    from datetime import date, time

    from backend.app.database import db
    from backend.models.mapa_natal import MapaNatal
    from backend.models.usuario import Usuario

    with app.app_context():
        usuario = Usuario(nome="Dono", email="delete@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.flush()
        principal = MapaNatal(
            usuario_id=usuario.id,
            nome="Principal",
            data_nascimento=date(1990, 1, 1),
            horario_nascimento=time(12),
            local_nascimento="São Paulo, SP",
            status="concluido",
        )
        extra = MapaNatal(
            usuario_id=usuario.id,
            nome="Extra",
            data_nascimento=date(1995, 5, 5),
            horario_nascimento=time(8, 30),
            local_nascimento="Curitiba, PR",
            status="concluido",
        )
        db.session.add_all([principal, extra])
        db.session.commit()
        usuario_id = usuario.id
        principal_id = principal.id
        extra_id = extra.id

    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    protegido = client.delete(f"/mapas/{principal_id}")
    assert protegido.status_code == 409
    assert protegido.get_json()["erro"] == "O mapa principal não pode ser excluído."

    excluido = client.delete(f"/mapas/{extra_id}")
    assert excluido.status_code == 200
    assert excluido.get_json()["status"] == "excluido"

    with app.app_context():
        assert db.session.get(MapaNatal, extra_id).status == "excluido"

    mapas = client.get("/mapas").get_json()["mapas"]
    assert [mapa["id"] for mapa in mapas] == [principal_id]
    assert client.get(
        f"/mapas/{extra_id}", headers={"Accept": "application/json"}
    ).status_code == 404
