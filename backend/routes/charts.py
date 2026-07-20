from flask import Blueprint, jsonify, render_template, request


charts_bp = Blueprint("charts", __name__, url_prefix="/mapas")


@charts_bp.get("/novo")
def novo():
    return render_template("criacaoMapa.html")


@charts_bp.get("/principal")
def principal():
    # O mapa exibido ainda é demonstrativo; depois virá do usuário autenticado.
    return render_template("home.html")


@charts_bp.post("")
def criar():
    campos = ("data_nascimento", "horario_nascimento", "local_nascimento")
    if any(not request.form.get(campo) for campo in campos):
        return jsonify(erro="Data, horário e local de nascimento são obrigatórios."), 400

    return jsonify(
        erro="O cálculo e a persistência do mapa ainda não foram configurados.",
        proxima_etapa="Conectar esta rota ao MapaNatalService e ao SQLite.",
    ), 501


@charts_bp.get("/<int:mapa_id>")
def detalhe(mapa_id):
    return render_template("result.html", mapa_id=mapa_id)


@charts_bp.get("/principal/interpretacoes")
def interpretacoes():
    return render_template("interpretacoesPlanetas.html")


@charts_bp.get("/processando")
def processando():
    return render_template("carregando.html")
