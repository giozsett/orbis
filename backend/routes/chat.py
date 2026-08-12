from datetime import date

from flask import Blueprint, current_app, jsonify, request, session
from pydantic import ValidationError

from backend.schemas.chat_schema import ChatMensagemSchema
from backend.services.chat_service import (
    ChatError,
    ChatGeracaoError,
    HistoricoDiaNaoEncontrado,
    LimitePerguntasExcedido,
    MapaPrincipalNaoEncontrado,
    enviar_mensagem as processar_mensagem,
    listar_historico_chat,
    obter_historico_dia,
    obter_estado_chat,
)
from backend.services.openrouter_service import (
    OpenRouterConfigurationError,
    OpenRouterResponseError,
)
from backend.app.frontend import servir_spa


chat_bp = Blueprint("chat", __name__, url_prefix="/chat")


@chat_bp.get("")
def pagina():
    if request.accept_mimetypes.best == "application/json":
        if "usuario_id" not in session:
            return jsonify(erro="Faça login para acessar o Chat Astral."), 401
        try:
            return jsonify(obter_estado_chat(session["usuario_id"]))
        except MapaPrincipalNaoEncontrado as erro:
            return jsonify(erro=str(erro), codigo="mapa_principal_ausente"), 404
    return servir_spa()


@chat_bp.post("/mensagens")
def enviar_mensagem():
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para conversar com o Assistente Orbis."), 401
    if not request.is_json:
        return jsonify(erro="Envie os dados como JSON."), 415

    try:
        entrada = ChatMensagemSchema.model_validate(request.get_json(silent=True) or {})
        return jsonify(processar_mensagem(session["usuario_id"], entrada.mensagem))
    except ValidationError:
        return jsonify(erro="A pergunta deve conter entre 1 e 500 caracteres."), 400
    except LimitePerguntasExcedido as erro:
        return jsonify(
            erro=str(erro),
            codigo="limite_chat_atingido",
            limite={"total": 3, "usadas": 3, "restantes": 0, "reset_em": erro.reset_em.isoformat()},
        ), 429
    except MapaPrincipalNaoEncontrado as erro:
        return jsonify(erro=str(erro), codigo="mapa_principal_ausente"), 404
    except OpenRouterConfigurationError as erro:
        return jsonify(erro=str(erro), codigo="openrouter_nao_configurado"), 503
    except (OpenRouterResponseError, ChatGeracaoError) as erro:
        current_app.logger.warning("Falha no Chat Astral: %s", erro)
        return jsonify(erro="Não foi possível responder agora. Tente novamente em instantes."), 502
    except ChatError as erro:
        return jsonify(erro=str(erro)), 400
    except Exception:
        current_app.logger.exception("Falha inesperada no Chat Astral")
        return jsonify(erro="Não foi possível salvar a conversa."), 500


@chat_bp.get("/historico")
def listar_historico():
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para acessar o histórico do Chat Astral."), 401
    try:
        cursor = date.fromisoformat(request.args["cursor"]) if request.args.get("cursor") else None
        limite = int(request.args.get("limite", 20))
        return jsonify(listar_historico_chat(session["usuario_id"], cursor=cursor, limite=limite))
    except (ValueError, TypeError):
        return jsonify(erro="Cursor ou limite de histórico inválido."), 400


@chat_bp.get("/historico/<data_iso>")
def historico_do_dia(data_iso):
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para acessar o histórico do Chat Astral."), 401
    try:
        data_local = date.fromisoformat(data_iso)
    except ValueError:
        return jsonify(erro="Informe uma data válida no formato AAAA-MM-DD."), 400
    try:
        return jsonify(obter_historico_dia(session["usuario_id"], data_local))
    except HistoricoDiaNaoEncontrado as erro:
        return jsonify(erro=str(erro)), 404
