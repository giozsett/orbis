from datetime import date, time

import pytest

from backend.app import create_app
from backend.app.config import TestingConfig
from backend.app.database import db
from backend.models import MapaNatal, Usuario

JSON = {"Accept": "application/json"}


@pytest.fixture
def cliente_com_mapa():
    app = create_app(TestingConfig)
    with app.app_context():
        usuario = Usuario(nome="Teste", email="teste@orbis.dev", senha_hash="x")
        db.session.add(usuario)
        db.session.flush()
        mapa = MapaNatal(
            usuario_id=usuario.id,
            nome="Mapa de teste",
            data_nascimento=date(1990, 8, 15),
            horario_nascimento=time(10, 30),
            local_nascimento="São Paulo, SP",
            dados={"planetas": []},
            status="concluido",
        )
        db.session.add(mapa)
        db.session.commit()
        cliente = app.test_client()
        yield cliente, usuario.id, mapa.id
        db.drop_all()


def test_tarot_exige_login(cliente_com_mapa):
    cliente, _, mapa_id = cliente_com_mapa
    assert cliente.get(f"/mapas/{mapa_id}/tarot", headers=JSON).status_code == 401


def test_tarot_do_mapa(cliente_com_mapa):
    cliente, usuario_id, mapa_id = cliente_com_mapa
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    resposta = cliente.get(f"/mapas/{mapa_id}/tarot?ano=2026", headers=JSON)
    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert dados["mapa"] == {"id": mapa_id, "nome": "Mapa de teste", "data_nascimento": "1990-08-15"}
    assert dados["arcanos"]["pessoal"]["numero"] == 6
    assert dados["arcanos"]["complementar"] is None
    assert dados["arcanos"]["anual"]["numero"] == 6
    assert dados["matriz"]["pontos"]["E"] == 12
    assert len(dados["catalogo"]) == 22


def test_tarot_do_mapa_principal_e_ano_invalido(cliente_com_mapa):
    cliente, usuario_id, _ = cliente_com_mapa
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    assert cliente.get("/mapas/principal/tarot", headers=JSON).status_code == 200
    assert cliente.get("/mapas/principal/tarot?ano=1200", headers=JSON).status_code == 400
    assert cliente.get("/mapas/999/tarot", headers=JSON).status_code == 404
