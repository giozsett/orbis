from datetime import date, time

from backend.app.database import db
from backend.models.mapa_natal import MapaNatal
from backend.models.usuario import Usuario
from backend.services.mapa_natal_service import calcular_mapa_natal
from backend.services.relatorio_pdf_service import TAMANHO_MAXIMO_PDF


def _autenticar_com_mapa_completo(client, app):
    with app.app_context():
        usuario = Usuario(nome="Menu", email="menu@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.flush()
        dados = calcular_mapa_natal({
            "data_nascimento": "1990-01-01",
            "horario_nascimento": "12:00",
            "latitude": -23.5329,
            "longitude": -46.6395,
            "timezone_id": "America/Sao_Paulo",
        })
        mapa = MapaNatal(
            usuario_id=usuario.id,
            nome="Mapa do menu",
            data_nascimento=date(1990, 1, 1),
            horario_nascimento=time(12),
            local_nascimento="São Paulo, SP",
            utc_offset_minutos=-120,
            status="concluido",
            dados=dados,
        )
        db.session.add(mapa)
        db.session.commit()
        usuario_id = usuario.id
        mapa_id = mapa.id
    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id
    return mapa_id


def test_asteroides_e_exportacao_exigem_autenticacao(client):
    assert client.get("/mapas/principal/asteroides").status_code == 401
    assert client.get("/mapas/principal/exportacao?formato=pdf").status_code == 401
    assert client.get("/mapas/1/asteroides").status_code == 401
    assert client.get("/mapas/1/exportacao?formato=pdf").status_code == 401


def test_calcula_cinco_asteroides_do_mapa_principal(client, app):
    _autenticar_com_mapa_completo(client, app)

    resposta = client.get("/mapas/principal/asteroides")
    dados = resposta.get_json()

    assert resposta.status_code == 200
    assert [item["nome"] for item in dados["asteroides"]] == [
        "Quíron", "Ceres", "Palas", "Juno", "Vesta",
    ]
    assert all(1 <= item["casa"] <= 12 for item in dados["asteroides"])
    assert all(item["posicao"] for item in dados["asteroides"])


def test_exporta_pdf_vetorial_abaixo_de_15_mb(client, app):
    _autenticar_com_mapa_completo(client, app)

    resposta = client.get("/mapas/principal/exportacao?formato=pdf")

    assert resposta.status_code == 200
    assert resposta.mimetype == "application/pdf"
    assert resposta.data.startswith(b"%PDF-")
    assert len(resposta.data) < TAMANHO_MAXIMO_PDF
    assert "attachment" in resposta.headers["Content-Disposition"]


def test_exportacao_rejeita_formato_nao_suportado(client, app):
    _autenticar_com_mapa_completo(client, app)

    resposta = client.get("/mapas/principal/exportacao?formato=csv")

    assert resposta.status_code == 400


def test_exporta_pdf_do_mapa_escolhido_com_nome_personalizado(client, app):
    mapa_id = _autenticar_com_mapa_completo(client, app)

    resposta = client.get(f"/mapas/{mapa_id}/exportacao?formato=pdf")

    assert resposta.status_code == 200
    assert resposta.data.startswith(b"%PDF-")
    assert "orbis-mapa-do-menu.pdf" in resposta.headers["Content-Disposition"]


def test_calcula_asteroides_do_mapa_escolhido(client, app):
    mapa_id = _autenticar_com_mapa_completo(client, app)

    resposta = client.get(f"/mapas/{mapa_id}/asteroides")

    assert resposta.status_code == 200
    assert resposta.get_json()["mapa"]["id"] == mapa_id


def test_rotas_por_mapa_nao_expoem_mapa_de_outro_usuario(client, app):
    _autenticar_com_mapa_completo(client, app)
    with app.app_context():
        outro = Usuario(nome="Outro", email="outro@orbis.local", senha_hash="hash")
        db.session.add(outro)
        db.session.flush()
        mapa = MapaNatal(
            usuario_id=outro.id,
            nome="Mapa privado",
            data_nascimento=date(1992, 2, 2),
            horario_nascimento=time(10),
            local_nascimento="Curitiba, PR",
            utc_offset_minutos=-180,
            status="concluido",
            dados={},
        )
        db.session.add(mapa)
        db.session.commit()
        mapa_id = mapa.id

    assert client.get(f"/mapas/{mapa_id}/exportacao").status_code == 404
    assert client.get(f"/mapas/{mapa_id}/asteroides").status_code == 404
