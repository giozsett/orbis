from datetime import date, time

from backend.app.database import db
from backend.models.mapa_natal import MapaNatal
from backend.models.usuario import Usuario
from tests.test_horoscopo_service import RESPOSTA_MODELO


def _autenticar_com_mapa(client, app, *, com_mapa=True):
    with app.app_context():
        usuario = Usuario(nome="Usuário", email="horoscopo@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.flush()
        if com_mapa:
            mapa = MapaNatal(
                usuario_id=usuario.id,
                data_nascimento=date(1992, 5, 20),
                horario_nascimento=time(10, 30),
                local_nascimento="Recife, PE",
                status="concluido",
                dados={
                    "planetas": [
                        {"nome": "Sol", "signo": "Touro", "grau": 59.0, "casa": 10},
                        {"nome": "Lua", "signo": "Aquário", "grau": 305.0, "casa": 6},
                    ],
                    "ascendente": {"signo": "Leão", "grau": 130.0},
                },
            )
            db.session.add(mapa)
        db.session.commit()
        usuario_id = usuario.id

    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id
    return usuario_id


def test_horoscopo_exige_autenticacao(client):
    resposta_get = client.get("/horoscopo", headers={"Accept": "application/json"})
    resposta_post = client.post("/horoscopo/gerar", json={"periodo": "diario"})

    assert resposta_get.status_code == 401
    assert resposta_post.status_code == 401


def test_horoscopo_exige_mapa_principal(client, app):
    _autenticar_com_mapa(client, app, com_mapa=False)

    resposta = client.get("/horoscopo", headers={"Accept": "application/json"})

    assert resposta.status_code == 404
    assert resposta.get_json()["codigo"] == "mapa_principal_ausente"


def test_gera_e_consulta_horoscopo_personalizado(client, app, monkeypatch):
    _autenticar_com_mapa(client, app)
    chamadas = []

    def completar_mock(*args, **kwargs):
        chamadas.append((args, kwargs))
        return RESPOSTA_MODELO

    monkeypatch.setattr(
        "backend.services.horoscopo_service.completar", completar_mock
    )
    app.config["OPENROUTER_HOROSCOPE_MODEL"] = "modelo/teste:free"

    gerado = client.post("/horoscopo/gerar", json={"periodo": "quinzenal"})
    repetido = client.post("/horoscopo/gerar", json={"periodo": "quinzenal"})
    consulta = client.get("/horoscopo", headers={"Accept": "application/json"})

    assert gerado.status_code == 200
    assert gerado.get_json()["cache"] is False
    assert repetido.status_code == 200
    assert repetido.get_json()["cache"] is True
    assert len(chamadas) == 1
    assert consulta.status_code == 200
    assert consulta.get_json()["horoscopos"]["quinzenal"]["areas"][0]["nome"] == "Amor"


def test_rejeita_periodicidade_desconhecida(client, app):
    _autenticar_com_mapa(client, app)

    resposta = client.post("/horoscopo/gerar", json={"periodo": "anual"})

    assert resposta.status_code == 400
    assert "Período inválido" in resposta.get_json()["erro"]
