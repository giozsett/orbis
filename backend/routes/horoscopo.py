from flask import Blueprint, jsonify, render_template


horoscopo_bp = Blueprint("horoscopo", __name__, url_prefix="/horoscopo")


@horoscopo_bp.get("")
def pagina():
    return render_template("horoscopoPersonalizado.html")


@horoscopo_bp.post("/gerar")
def gerar():
    return jsonify(
        erro="A geração de horóscopo ainda não foi configurada.",
        proxima_etapa="Buscar o mapa principal e aplicar os limites do plano.",
    ), 501
