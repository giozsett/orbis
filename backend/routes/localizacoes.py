from flask import Blueprint, jsonify, request

from backend.services.localizacao_service import (
    buscar_cidade,
    listar_cidades,
    listar_paises,
)


localizacoes_bp = Blueprint("localizacoes", __name__, url_prefix="/api/localizacoes")


@localizacoes_bp.get("/paises")
def paises():
    return jsonify(paises=listar_paises())


@localizacoes_bp.get("/cidades")
def sugerir_cidades():
    consulta = request.args.get("q", "").strip()
    if len(consulta) < 2:
        return jsonify(cidades=[])

    try:
        limite = int(request.args.get("limite", 10))
    except ValueError:
        return jsonify(erro="O limite deve ser um número inteiro."), 400

    pais_codigo = request.args.get("pais", "BR").strip().upper()
    return jsonify(cidades=listar_cidades(consulta, pais_codigo, limite))


@localizacoes_bp.get("/cidades/<codigo_ibge>")
def detalhar_cidade(codigo_ibge):
    cidade = buscar_cidade(codigo_ibge, request.args.get("pais", "BR"))
    if cidade is None:
        return jsonify(erro="Cidade não encontrada."), 404
    return jsonify(cidade=cidade)
