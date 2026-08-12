from datetime import date, datetime, time, timezone

import pytest

from backend.app.database import db
from backend.app.schema_upgrade import aplicar_atualizacoes_aditivas
from backend.models.chat_mensagem import ChatMensagem
from backend.models.chat_dia import ChatDia
from backend.models.mapa_natal import MapaNatal
from backend.models.usuario import Usuario
from backend.services.chat_service import (
    ChatGeracaoError,
    LimitePerguntasExcedido,
    enviar_mensagem,
    listar_historico_chat,
    obter_historico_dia,
    obter_estado_chat,
)
from backend.services.openrouter_service import OpenRouterResponseError


DADOS_MAPA = {
    "sistema_casas": "Placidus",
    "planetas": [
        {"nome": "Sol", "signo": "Capricórnio", "casa": 7, "posicao": "10° 00'"},
        {"nome": "Lua", "signo": "Peixes", "casa": 9, "posicao": "15° 00'"},
        {"nome": "Mercúrio", "signo": "Aquário", "casa": 8, "posicao": "02° 00'"},
        {"nome": "Vênus", "signo": "Sagitário", "casa": 6, "posicao": "20° 00'"},
        {"nome": "Marte", "signo": "Touro", "casa": 11, "posicao": "08° 00'"},
        {"nome": "Júpiter", "signo": "Câncer", "casa": 1, "posicao": "14° 00'"},
        {"nome": "Saturno", "signo": "Capricórnio", "casa": 7, "posicao": "18° 00'"},
    ],
    "ascendente": {"signo": "Câncer", "posicao": "01° 00'"},
    "meio_do_ceu": {"signo": "Áries", "posicao": "12° 00'"},
    "aspectos": [
        {
            "tipo": "trígono",
            "planeta1": {"nome": "Sol"},
            "planeta2": {"nome": "Marte"},
        }
    ],
}


def criar_usuario_com_mapa(app, *, com_mapa=True):
    with app.app_context():
        usuario = Usuario(nome="Astral", email="chat@orbis.local", senha_hash="hash")
        db.session.add(usuario)
        db.session.flush()
        if com_mapa:
            mapa = MapaNatal(
                usuario_id=usuario.id,
                nome="Mapa principal",
                data_nascimento=date(1990, 1, 1),
                horario_nascimento=time(12),
                local_nascimento="São Paulo, SP",
                status="concluido",
                dados=DADOS_MAPA,
            )
            db.session.add(mapa)
        db.session.commit()
        return usuario.id


def test_estado_usa_mapa_principal_e_oferece_sugestoes_personalizadas(app):
    usuario_id = criar_usuario_com_mapa(app)

    with app.app_context():
        estado = obter_estado_chat(usuario_id)

    assert estado["mapa"]["sol"]["signo"] == "Capricórnio"
    assert estado["mapa"]["lua"]["signo"] == "Peixes"
    assert estado["limite"]["restantes"] == 3
    assert len(estado["sugestoes"]) == 10
    assert any("Vênus em Sagitário" in item["pergunta"] for item in estado["sugestoes"])
    assert any("trígono entre Sol e Marte" in item["pergunta"] for item in estado["sugestoes"])


def test_agente_recebe_contexto_natal_e_persiste_conversa(app, monkeypatch):
    usuario_id = criar_usuario_com_mapa(app)
    chamadas = []

    def completar_mock(mensagens, modelo, **opcoes):
        chamadas.append((mensagens, modelo, opcoes))
        return "Seu Sol em Capricórnio sugere construir acordos com constância."

    monkeypatch.setattr("backend.services.chat_service.completar", completar_mock)

    with app.app_context():
        resultado = enviar_mensagem(usuario_id, "Como expresso melhor meu Sol?")
        salvas = ChatMensagem.query.order_by(ChatMensagem.id).all()

    assert resultado["limite"]["restantes"] == 2
    assert [item.papel for item in salvas] == ["user", "assistant"]
    with app.app_context():
        dia = ChatDia.query.one()
        assert dia.quantidade_perguntas == 1
        assert all(item.chat_dia_id == dia.id for item in ChatMensagem.query.all())
    assert len(chamadas) == 1
    assert chamadas[0][1] == "google/gemma-4-26b-a4b-it:free"
    assert chamadas[0][2]["modelos_fallback"] == ("openrouter/free",)
    assert chamadas[0][2]["max_tokens"] == 420
    assert "Capricórnio" in chamadas[0][0][0]["content"]


def test_limita_tres_perguntas_em_janela_movel_de_24_horas(app, monkeypatch):
    usuario_id = criar_usuario_com_mapa(app)
    monkeypatch.setattr(
        "backend.services.chat_service.completar",
        lambda *_args, **_kwargs: "Resposta breve e personalizada.",
    )
    agora = datetime(2026, 8, 4, 12, tzinfo=timezone.utc)

    with app.app_context():
        for numero in range(3):
            enviar_mensagem(usuario_id, f"Pergunta {numero + 1}", agora=agora)

        with pytest.raises(LimitePerguntasExcedido) as erro:
            enviar_mensagem(usuario_id, "Quarta pergunta", agora=agora)

        assert ChatMensagem.query.filter_by(papel="user").count() == 3
        assert ChatMensagem.query.filter_by(papel="assistant").count() == 3
        assert ChatDia.query.one().quantidade_perguntas == 3

    assert erro.value.reset_em.isoformat() == "2026-08-05T12:00:00+00:00"


def test_falha_do_modelo_nao_consume_pergunta(app, monkeypatch):
    usuario_id = criar_usuario_com_mapa(app)

    def falhar(*_args, **_kwargs):
        raise OpenRouterResponseError("indisponível")

    monkeypatch.setattr("backend.services.chat_service.completar", falhar)

    with app.app_context():
        with pytest.raises(ChatGeracaoError):
            enviar_mensagem(usuario_id, "Minha pergunta")

        assert ChatMensagem.query.count() == 0
        assert ChatDia.query.count() == 0
        assert obter_estado_chat(usuario_id)["limite"]["restantes"] == 3


def test_historico_lista_apenas_dias_com_perguntas(app, monkeypatch):
    usuario_id = criar_usuario_com_mapa(app)
    monkeypatch.setattr(
        "backend.services.chat_service.completar",
        lambda *_args, **_kwargs: "Resposta do histórico.",
    )
    primeiro_dia = datetime(2026, 8, 4, 12, tzinfo=timezone.utc)
    segundo_dia = datetime(2026, 8, 7, 12, tzinfo=timezone.utc)

    with app.app_context():
        enviar_mensagem(usuario_id, "Pergunta do primeiro dia", agora=primeiro_dia)
        enviar_mensagem(usuario_id, "Pergunta do segundo dia", agora=segundo_dia)
        historico = listar_historico_chat(usuario_id)
        conversa = obter_historico_dia(usuario_id, date(2026, 8, 4))

    assert [item["data"] for item in historico["dias"]] == ["2026-08-07", "2026-08-04"]
    assert all(item["quantidade_perguntas"] == 1 for item in historico["dias"])
    assert historico["dias"][1]["primeira_pergunta"] == "Pergunta do primeiro dia"
    assert [item["papel"] for item in conversa["mensagens"]] == ["user", "assistant"]


def test_upgrade_vincula_mensagens_antigas_sem_apagar_conteudo(app):
    usuario_id = criar_usuario_com_mapa(app)
    criado_em = datetime(2026, 8, 9, 15, tzinfo=timezone.utc)
    with app.app_context():
        mapa_id = MapaNatal.query.filter_by(usuario_id=usuario_id).one().id
        db.session.add_all([
            ChatMensagem(usuario_id=usuario_id, mapa_id=mapa_id, papel="user", mensagem="Mensagem antiga", criado_em=criado_em),
            ChatMensagem(usuario_id=usuario_id, mapa_id=mapa_id, papel="assistant", mensagem="Resposta antiga", criado_em=criado_em),
        ])
        db.session.commit()

        aplicar_atualizacoes_aditivas()
        dia = ChatDia.query.one()
        mensagens = ChatMensagem.query.order_by(ChatMensagem.id).all()

    assert dia.data_local.isoformat() == "2026-08-09"
    assert dia.quantidade_perguntas == 1
    assert [item.mensagem for item in mensagens] == ["Mensagem antiga", "Resposta antiga"]
    assert all(item.chat_dia_id == dia.id for item in mensagens)
