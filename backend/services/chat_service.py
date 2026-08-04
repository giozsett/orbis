"""Chat astral personalizado pelo mapa principal, com cota de uso."""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta, timezone

from agno.agent import Agent
from agno.run.base import RunStatus
from backend.app.database import db
from backend.models.chat_mensagem import ChatMensagem
from backend.models.mapa_natal import MapaNatal
from backend.services.agno_openrouter_model import OpenRouterAgnoModel
from backend.services.modelo_config_service import obter_modelos
from backend.services.openrouter_service import completar


LIMITE_PERGUNTAS = 3
JANELA_PERGUNTAS = timedelta(hours=24)
MAXIMO_CARACTERES = 500
MAXIMO_HISTORICO_MODELO = 6
MAXIMO_HISTORICO_TELA = 20


class ChatError(RuntimeError):
    """Erro base do domínio do chat."""


class MapaPrincipalNaoEncontrado(ChatError):
    """O usuário ainda não possui um mapa principal concluído."""


class LimitePerguntasExcedido(ChatError):
    def __init__(self, reset_em: datetime):
        self.reset_em = reset_em
        super().__init__("Você já usou suas 3 perguntas nas últimas 24 horas.")


class ChatGeracaoError(ChatError):
    """O agente não devolveu uma resposta utilizável."""


def obter_estado_chat(usuario_id: int, *, agora: datetime | None = None) -> dict:
    agora = _agora_utc(agora)
    mapa = buscar_mapa_principal(usuario_id)
    limite = _obter_limite(usuario_id, agora)
    mensagens = _buscar_historico(usuario_id, mapa.id, MAXIMO_HISTORICO_TELA)
    resumo = _resumo_publico_mapa(mapa.dados or {})

    return {
        "mapa": {
            "id": mapa.id,
            "nome": mapa.nome or "Meu mapa natal",
            **resumo,
        },
        "saudacao": _saudacao(mapa.nome, resumo),
        "sugestoes": gerar_sugestoes(mapa.dados or {}),
        "mensagens": [_serializar_mensagem(item) for item in mensagens],
        "limite": limite,
    }


def enviar_mensagem(
    usuario_id: int,
    mensagem: str,
    *,
    agora: datetime | None = None,
) -> dict:
    agora = _agora_utc(agora)
    mensagem = str(mensagem or "").strip()
    if not mensagem:
        raise ChatError("O campo 'mensagem' é obrigatório.")
    if len(mensagem) > MAXIMO_CARACTERES:
        raise ChatError(f"A pergunta deve ter no máximo {MAXIMO_CARACTERES} caracteres.")

    mapa = buscar_mapa_principal(usuario_id)
    limite = _obter_limite(usuario_id, agora)
    if limite["restantes"] <= 0:
        raise LimitePerguntasExcedido(_data_iso_para_datetime(limite["reset_em"]))

    historico = _buscar_historico(usuario_id, mapa.id, MAXIMO_HISTORICO_MODELO)
    pergunta = ChatMensagem(
        usuario_id=usuario_id,
        mapa_id=mapa.id,
        papel="user",
        mensagem=mensagem,
        criado_em=agora,
    )

    try:
        db.session.add(pergunta)
        db.session.flush()
        texto_resposta = _executar_agente(mapa, historico, mensagem)
        if not texto_resposta:
            raise ChatGeracaoError("O agente astral retornou uma resposta vazia.")
        resposta = ChatMensagem(
            usuario_id=usuario_id,
            mapa_id=mapa.id,
            papel="assistant",
            mensagem=texto_resposta,
            criado_em=agora,
        )
        db.session.add(resposta)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return {
        "mensagem_usuario": _serializar_mensagem(pergunta),
        "resposta": _serializar_mensagem(resposta),
        "limite": _obter_limite(usuario_id, agora),
    }


def buscar_mapa_principal(usuario_id: int) -> MapaNatal:
    mapa = (
        MapaNatal.query.filter_by(usuario_id=usuario_id, status="concluido")
        .order_by(MapaNatal.criado_em.asc(), MapaNatal.id.asc())
        .first()
    )
    if mapa is None:
        raise MapaPrincipalNaoEncontrado(
            "Crie seu mapa principal antes de conversar com o Assistente Orbis."
        )
    return mapa


def gerar_sugestoes(dados: dict) -> list[dict]:
    planetas = {item.get("nome"): item for item in dados.get("planetas", [])}
    sol = planetas.get("Sol", {})
    lua = planetas.get("Lua", {})
    venus = planetas.get("Vênus", {})
    marte = planetas.get("Marte", {})
    mercurio = planetas.get("Mercúrio", {})
    jupiter = planetas.get("Júpiter", {})
    saturno = planetas.get("Saturno", {})
    ascendente = dados.get("ascendente") or {}
    meio_do_ceu = dados.get("meio_do_ceu") or {}

    sugestoes = [
        _sugestao("Identidade", "auto_awesome", sol, "Como posso expressar melhor meu Sol em {signo} na Casa {casa}?"),
        _sugestao("Emoções", "dark_mode", lua, "O que minha Lua em {signo} na Casa {casa} revela sobre minhas necessidades emocionais?"),
        _sugestao("Relacionamentos", "favorite", venus, "Como Vênus em {signo} na Casa {casa} influencia minha forma de criar vínculos?"),
        _sugestao("Ação", "local_fire_department", marte, "Como direcionar de forma construtiva meu Marte em {signo} na Casa {casa}?"),
        _sugestao("Comunicação", "forum", mercurio, "Quais são os potenciais e cuidados de Mercúrio em {signo} na Casa {casa}?"),
        _sugestao("Expansão", "expand_circle_up", jupiter, "Onde Júpiter em {signo} na Casa {casa} sugere oportunidades de crescimento?"),
        _sugestao("Maturidade", "schedule", saturno, "Que aprendizados Saturno em {signo} na Casa {casa} convida a desenvolver?"),
    ]

    if ascendente.get("signo"):
        sugestoes.append({
            "categoria": "Presença",
            "icone": "person_pin_circle",
            "pergunta": f"Como meu Ascendente em {ascendente['signo']} aparece na forma como inicio projetos e relações?",
        })
    if meio_do_ceu.get("signo"):
        sugestoes.append({
            "categoria": "Vocação",
            "icone": "work",
            "pergunta": f"O que meu Meio do Céu em {meio_do_ceu['signo']} simboliza para minha vocação?",
        })

    aspecto = next(iter(dados.get("aspectos") or []), None)
    if aspecto:
        primeiro = (aspecto.get("planeta1") or {}).get("nome")
        segundo = (aspecto.get("planeta2") or {}).get("nome")
        if primeiro and segundo:
            sugestoes.append({
                "categoria": "Integração",
                "icone": "hub",
                "pergunta": f"Como posso compreender o aspecto de {aspecto.get('tipo', 'conexão')} entre {primeiro} e {segundo} no meu mapa?",
            })

    return [item for item in sugestoes if item][:10]


def _sugestao(categoria: str, icone: str, planeta: dict, modelo: str) -> dict | None:
    if not planeta.get("signo") or not planeta.get("casa"):
        return None
    return {
        "categoria": categoria,
        "icone": icone,
        "pergunta": modelo.format(signo=planeta["signo"], casa=planeta["casa"]),
    }


def _executar_agente(mapa: MapaNatal, historico: list[ChatMensagem], mensagem: str) -> str:
    modelos = obter_modelos("chat")
    agente = Agent(
        name="Assistente Orbis",
        model=OpenRouterAgnoModel(
            id=modelos[0],
            modelos_fallback=tuple(modelos[1:]),
            cliente=completar,
        ),
        description="Assistente de astrologia reflexiva do ORBIS.",
        instructions=[
            "Responda em português do Brasil, com acolhimento, clareza e sobriedade.",
            "Personalize a resposta somente com as posições do mapa fornecido.",
            "Não invente trânsitos, aspectos ou posições que não estejam no contexto.",
            "Trate astrologia como linguagem simbólica de autoconhecimento, nunca como fato ou destino inevitável.",
            "Não ofereça aconselhamento médico, jurídico ou financeiro.",
            "Responda diretamente à pergunta em no máximo 140 palavras.",
        ],
        additional_context=_contexto_agente(mapa, historico),
        markdown=False,
        retries=0,
        telemetry=False,
    )
    execucao = agente.run(mensagem)
    if execucao.status == RunStatus.error:
        raise ChatGeracaoError(str(execucao.content or "Falha ao executar o agente astral."))
    return str(execucao.content or "").strip()


def _contexto_agente(mapa: MapaNatal, historico: list[ChatMensagem]) -> str:
    dados = mapa.dados or {}
    posicoes = [
        f"{item.get('nome')}: {item.get('signo')}, Casa {item.get('casa')}, {item.get('posicao')}"
        for item in dados.get("planetas", [])
    ]
    ascendente = dados.get("ascendente") or {}
    meio_do_ceu = dados.get("meio_do_ceu") or {}
    aspectos = []
    for item in (dados.get("aspectos") or [])[:6]:
        primeiro = (item.get("planeta1") or {}).get("nome")
        segundo = (item.get("planeta2") or {}).get("nome")
        if primeiro and segundo:
            aspectos.append(f"{primeiro} {item.get('tipo')} {segundo}")
    conversa = [
        f"{item.papel}: {item.mensagem[:500]}"
        for item in historico[-MAXIMO_HISTORICO_MODELO:]
    ]
    return (
        f"MAPA PRINCIPAL: {mapa.nome or 'Meu mapa natal'}\n"
        f"ASCENDENTE: {ascendente.get('signo', 'não informado')} {ascendente.get('posicao', '')}\n"
        f"MEIO DO CÉU: {meio_do_ceu.get('signo', 'não informado')} {meio_do_ceu.get('posicao', '')}\n"
        f"POSIÇÕES: {'; '.join(posicoes)}\n"
        f"ASPECTOS NATAIS: {'; '.join(aspectos) or 'não informados'}\n"
        f"HISTÓRICO RECENTE: {' | '.join(conversa) or 'primeira pergunta'}"
    )


def _obter_limite(usuario_id: int, agora: datetime) -> dict:
    corte = agora - JANELA_PERGUNTAS
    perguntas = (
        ChatMensagem.query.filter(
            ChatMensagem.usuario_id == usuario_id,
            ChatMensagem.papel == "user",
            ChatMensagem.criado_em > corte,
        )
        .order_by(ChatMensagem.criado_em.asc(), ChatMensagem.id.asc())
        .all()
    )
    usadas = len(perguntas)
    reset_em = None
    if perguntas:
        reset_em = (_como_utc(perguntas[0].criado_em) + JANELA_PERGUNTAS).isoformat()
    return {
        "total": LIMITE_PERGUNTAS,
        "usadas": usadas,
        "restantes": max(0, LIMITE_PERGUNTAS - usadas),
        "reset_em": reset_em,
    }


def _buscar_historico(usuario_id: int, mapa_id: int, limite: int) -> list[ChatMensagem]:
    mensagens = (
        ChatMensagem.query.filter_by(usuario_id=usuario_id, mapa_id=mapa_id)
        .order_by(ChatMensagem.criado_em.desc(), ChatMensagem.id.desc())
        .limit(limite)
        .all()
    )
    return list(reversed(mensagens))


def _resumo_publico_mapa(dados: dict) -> dict:
    planetas = {item.get("nome"): item for item in dados.get("planetas", [])}
    return {
        "sol": deepcopy(planetas.get("Sol")),
        "lua": deepcopy(planetas.get("Lua")),
        "ascendente": deepcopy(dados.get("ascendente") or {}),
    }


def _saudacao(nome_mapa: str | None, resumo: dict) -> str:
    sol = resumo.get("sol") or {}
    lua = resumo.get("lua") or {}
    return (
        f"Estou conectado ao {nome_mapa or 'seu mapa principal'}. "
        f"Posso ajudar a refletir sobre seu Sol em {sol.get('signo', 'seu signo solar')}, "
        f"sua Lua em {lua.get('signo', 'seu signo lunar')} e as outras posições natais."
    )


def _serializar_mensagem(item: ChatMensagem) -> dict:
    return {
        "id": item.id,
        "papel": item.papel,
        "mensagem": item.mensagem,
        "criado_em": _como_utc(item.criado_em).isoformat(),
    }


def _agora_utc(valor: datetime | None) -> datetime:
    return _como_utc(valor or datetime.now(timezone.utc))


def _como_utc(valor: datetime) -> datetime:
    if valor.tzinfo is None:
        return valor.replace(tzinfo=timezone.utc)
    return valor.astimezone(timezone.utc)


def _data_iso_para_datetime(valor: str | None) -> datetime:
    if not valor:
        return datetime.now(timezone.utc) + JANELA_PERGUNTAS
    return _como_utc(datetime.fromisoformat(valor))
