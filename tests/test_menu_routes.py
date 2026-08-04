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
    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id


def test_asteroides_e_exportacao_exigem_autenticacao(client):
    assert client.get("/mapas/principal/asteroides").status_code == 401
    assert client.get("/mapas/principal/exportacao?formato=pdf").status_code == 401


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
