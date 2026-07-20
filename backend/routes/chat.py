from flask import Blueprint, jsonify, render_template, request


chat_bp = Blueprint("chat", __name__, url_prefix="/chat")


@chat_bp.get("")
def pagina():
    return render_template("chatAstral.html")


@chat_bp.post("/mensagens")
def enviar_mensagem():
    if not request.is_json:
        return jsonify(erro="Envie os dados como JSON."), 415

    mensagem = str(request.json.get("mensagem", "")).strip()
    if not mensagem:
        return jsonify(erro="O campo 'mensagem' é obrigatório."), 400

    return jsonify(
        erro="O agente astral ainda não foi configurado.",
        proxima_etapa="Conectar o ChatService ao Agno e ao OpenRouter.",
    ), 501
