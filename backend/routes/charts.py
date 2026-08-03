from datetime import date, time

from flask import Blueprint, current_app, jsonify, redirect, render_template, request, session, url_for
from pydantic import ValidationError

from backend.schemas.mapa_natal_schema import MapaNatalSchema
from backend.app.database import db
from backend.models.mapa_natal import MapaNatal
from backend.services.mapa_natal_service import calcular_mapa_natal
from backend.services.localizacao_service import (
    converter_nascimento_para_utc,
    resolver_localizacao,
)


charts_bp = Blueprint("charts", __name__, url_prefix="/mapas")


@charts_bp.get("/novo")
def novo():
    return render_template("criacaoMapa.html")


@charts_bp.get("/principal")
def principal():
    if "usuario_id" not in session:
        return redirect(url_for("auth.acesso"))
    mapa = (
        MapaNatal.query.filter_by(usuario_id=session["usuario_id"], status="concluido")
        .order_by(MapaNatal.criado_em.desc())
        .first()
    )
    if mapa is None:
        return redirect(url_for("charts.novo"))
    if request.accept_mimetypes.best == "application/json":
        return jsonify(mapa=_serializar_mapa(mapa))
    return render_template("home.html", mapa=mapa, dados=mapa.dados)


@charts_bp.post("")
def criar():
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para criar um mapa."), 401

    entrada = request.get_json(silent=True) if request.is_json else request.form.to_dict()
    try:
        dados = MapaNatalSchema.model_validate(entrada or {})
    except ValidationError:
        return jsonify(
            erro="Data, horário e uma cidade selecionada são obrigatórios."
        ), 400

    localizacao = resolver_localizacao(dados.cidade_ibge)
    if localizacao is None:
        return jsonify(erro="Selecione uma cidade válida da lista de sugestões."), 400

    nascimento = converter_nascimento_para_utc(
        date.fromisoformat(str(dados.data_nascimento)),
        time.fromisoformat(str(dados.horario_nascimento)),
        localizacao["timezone_id"],
    )

    try:
        resultado = calcular_mapa_natal({
            "data_nascimento": dados.data_nascimento,
            "horario_nascimento": dados.horario_nascimento,
            "latitude": localizacao["latitude"],
            "longitude": localizacao["longitude"],
            "timezone_id": localizacao["timezone_id"],
        })
        mapa = MapaNatal(
            usuario_id=session["usuario_id"],
            nome=dados.nome,
            data_nascimento=dados.data_nascimento,
            horario_nascimento=dados.horario_nascimento,
            local_nascimento=localizacao["local_nascimento"],
            cidade_ibge=localizacao["ibge"],
            latitude=localizacao["latitude"],
            longitude=localizacao["longitude"],
            timezone_id=localizacao["timezone_id"],
            utc_offset_minutos=nascimento["utc_offset_minutos"],
            dados=resultado,
            status="concluido",
        )
        db.session.add(mapa)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Falha ao calcular ou persistir mapa natal")
        return jsonify(erro="Não foi possível calcular o mapa natal."), 422

    return jsonify(
        id=mapa.id,
        redirect=f"/mapa/{mapa.id}",
        mapa=_serializar_mapa(mapa),
    ), 201


@charts_bp.get("/<int:mapa_id>")
def detalhe(mapa_id):
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para acessar o mapa."), 401
    mapa = MapaNatal.query.filter_by(
        id=mapa_id,
        usuario_id=session["usuario_id"],
    ).first()
    if mapa is None:
        return jsonify(erro="Mapa não encontrado."), 404
    if request.accept_mimetypes.best == "application/json":
        return jsonify(mapa=_serializar_mapa(mapa))
    return render_template("result.html", mapa=mapa, mapa_id=mapa.id, dados=mapa.dados)


@charts_bp.get("/principal/interpretacoes")
def interpretacoes():
    return render_template("interpretacoesPlanetas.html")


@charts_bp.get("/processando")
def processando():
    return render_template("carregando.html")


def _serializar_mapa(mapa):
    return {
        "id": mapa.id,
        "nome": mapa.nome,
        "data_nascimento": mapa.data_nascimento.isoformat(),
        "horario_nascimento": mapa.horario_nascimento.isoformat(),
        "local_nascimento": mapa.local_nascimento,
        "cidade_ibge": mapa.cidade_ibge,
        "latitude": mapa.latitude,
        "longitude": mapa.longitude,
        "timezone_id": mapa.timezone_id,
        "utc_offset_minutos": mapa.utc_offset_minutos,
        "status": mapa.status,
        "dados": mapa.dados,
    }
