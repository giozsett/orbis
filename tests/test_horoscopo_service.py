import json
from datetime import date, time

import pytest

from backend.app.database import db
from backend.models.mapa_natal import MapaNatal
from backend.models.usuario import Usuario
from backend.services.horoscopo_service import (
    HoroscopoGeracaoError,
    gerar_horoscopo,
    limites_periodo,
)


RESPOSTA_MODELO = json.dumps({
    "titulo": "Um ciclo de presença e escolhas conscientes",
    "resumo": "Os trânsitos destacam um período de observação e ajustes cuidadosos.",
    "conselho": "Escolha uma prioridade e avance com constância, respeitando seus limites.",
    "destaque_astral": "Sol em aspecto com o Sol natal",
    "palavras_chave": ["presença", "constância", "clareza"],
    "areas": [
        {"nome": "Amor", "texto": "Escute antes de reagir.", "energia": 74, "tendencia": "alta"},
        {"nome": "Trabalho", "texto": "Organize as prioridades.", "energia": 62, "tendencia": "estavel"},
        {"nome": "Bem-estar", "texto": "Reserve pausas conscientes.", "energia": 55, "tendencia": "baixa"},
    ],
}, ensure_ascii=False)


def _criar_mapa(app):
    with app.app_context():
        usuario = Usuario(nome="Astral", email="astral@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.flush()
        mapa = MapaNatal(
            usuario_id=usuario.id,
            nome="Mapa principal",
            data_nascimento=date(1990, 1, 1),
            horario_nascimento=time(12),
            local_nascimento="São Paulo, SP",
            status="concluido",
            dados={
                "sistema_casas": "Placidus",
                "ascendente": {"signo": "Câncer", "grau": 101.0},
                "meio_do_ceu": {"signo": "Áries", "grau": 10.0},
                "planetas": [
                    {"nome": "Sol", "signo": "Capricórnio", "grau": 280.0, "casa": 7},
                    {"nome": "Lua", "signo": "Peixes", "grau": 345.0, "casa": 9},
                ],
            },
        )
        db.session.add(mapa)
        db.session.commit()
        return usuario.id, mapa.id


def test_limites_dos_ciclos_recomendados():
    referencia = date(2026, 8, 20)

    assert limites_periodo("diario", referencia)["inicio"] == "2026-08-20"
    assert limites_periodo("semanal", referencia)["inicio"] == "2026-08-17"
    assert limites_periodo("semanal", referencia)["fim"] == "2026-08-23"
    assert limites_periodo("quinzenal", referencia)["inicio"] == "2026-08-16"
    assert limites_periodo("quinzenal", referencia)["fim"] == "2026-08-31"
    assert limites_periodo("mensal", referencia)["inicio"] == "2026-08-01"
    assert limites_periodo("mensal", referencia)["fim"] == "2026-08-31"


def test_gera_com_mapa_principal_e_reutiliza_cache(app, monkeypatch):
    usuario_id, mapa_id = _criar_mapa(app)
    chamadas = []

    def completar_mock(mensagens, modelo, **opcoes):
        chamadas.append((mensagens, modelo, opcoes))
        return RESPOSTA_MODELO

    monkeypatch.setattr(
        "backend.services.horoscopo_service.completar", completar_mock
    )

    with app.app_context():
        app.config["OPENROUTER_HOROSCOPE_MODEL"] = "modelo/teste:free"
        primeiro, veio_do_cache = gerar_horoscopo(
            usuario_id, "diario", referencia=date(2026, 8, 3)
        )
        segundo, cache_na_segunda = gerar_horoscopo(
            usuario_id, "diario", referencia=date(2026, 8, 3)
        )

        assert veio_do_cache is False
        assert cache_na_segunda is True
        assert segundo == primeiro
        assert len(chamadas) == 1
        assert "Capricórnio" in chamadas[0][0][1]["content"]
        assert chamadas[0][1] == "modelo/teste:free"
        assert chamadas[0][2]["formato_json"] is True

        salvo = db.session.get(MapaNatal, mapa_id)
        assert salvo.horoscopo_dados["periodos"]["diario"]["titulo"] == primeiro["titulo"]


def test_rejeita_resposta_do_modelo_fora_do_contrato(app, monkeypatch):
    usuario_id, _ = _criar_mapa(app)
    monkeypatch.setattr(
        "backend.services.horoscopo_service.completar",
        lambda *_args, **_kwargs: '{"titulo": "incompleto"}',
    )

    with app.app_context():
        app.config["OPENROUTER_HOROSCOPE_MODEL"] = "modelo/teste:free"
        with pytest.raises(HoroscopoGeracaoError):
            gerar_horoscopo(usuario_id, "mensal", referencia=date(2026, 8, 3))
