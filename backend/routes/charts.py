from datetime import date, time
import re
import unicodedata

from io import BytesIO

from flask import Blueprint, current_app, jsonify, redirect, render_template, request, send_file, session, url_for
from pydantic import ValidationError

from backend.schemas.mapa_natal_schema import MapaNatalSchema
from backend.app.database import db
from backend.app.frontend import servir_spa
from backend.models.mapa_natal import MapaNatal
from backend.services.mapa_natal_service import calcular_mapa_natal
from backend.services.asteroide_service import AsteroideCalculoError, calcular_asteroides_mapa
from backend.services.interpretacao_base_service import enriquecer_dados_mapa
from backend.services.interpretation_service import (
    InterpretacaoError,
    MapaInterpretacaoNaoEncontrado,
    obter_interpretacoes,
)
from backend.services.modelo_config_service import ModeloConfigError
from backend.services.openrouter_service import (
    OpenRouterConfigurationError,
    OpenRouterResponseError,
)
from backend.services.relatorio_pdf_service import (
    RelatorioMuitoGrandeError,
    gerar_relatorio_pdf,
)
from backend.services.localizacao_service import (
    converter_nascimento_para_utc,
    resolver_localizacao,
)


charts_bp = Blueprint("charts", __name__, url_prefix="/mapas")


def _mapas_concluidos_do_usuario(usuario_id):
    return (
        MapaNatal.query.filter_by(usuario_id=usuario_id, status="concluido")
        .order_by(MapaNatal.criado_em.asc(), MapaNatal.id.asc())
    )


def _mapa_concluido_do_usuario(mapa_id, usuario_id):
    return MapaNatal.query.filter_by(
        id=mapa_id,
        usuario_id=usuario_id,
        status="concluido",
    ).first()


def _nome_arquivo_pdf(nome):
    base = unicodedata.normalize("NFKD", nome or "mapa").encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower() or "mapa"
    return f"orbis-{base}.pdf"


@charts_bp.get("/novo")
def novo():
    return redirect("/criar-mapa")


@charts_bp.get("")
def listar():
    if "usuario_id" not in session:
        if request.accept_mimetypes.best == "text/html":
            return redirect(url_for("auth.acesso"))
        return jsonify(erro="Faça login para acessar seus mapas."), 401

    mapas = _mapas_concluidos_do_usuario(session["usuario_id"]).all()
    principal_id = mapas[0].id if mapas else None
    resumos = [_serializar_resumo_mapa(mapa, principal_id) for mapa in mapas]
    if request.accept_mimetypes.best == "text/html":
        return redirect("/meus-mapas")
    return jsonify(mapas=resumos)


@charts_bp.get("/principal")
def principal():
    if "usuario_id" not in session:
        return redirect(url_for("auth.acesso"))
    mapa = _mapas_concluidos_do_usuario(session["usuario_id"]).first()
    if mapa is None:
        return redirect(url_for("charts.novo"))
    if request.accept_mimetypes.best == "application/json":
        return jsonify(mapa=_serializar_mapa(mapa))
    return redirect("/mapa")


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

    localizacao = resolver_localizacao(dados.cidade_id, dados.pais_codigo)
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
            cidade_ibge=localizacao.get("ibge"),
            pais_codigo=localizacao["pais_codigo"],
            geoname_id=localizacao.get("geoname_id"),
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
    mapa = _mapa_concluido_do_usuario(mapa_id, session["usuario_id"])
    if mapa is None:
        return jsonify(erro="Mapa não encontrado."), 404
    if request.accept_mimetypes.best == "application/json":
        return jsonify(mapa=_serializar_mapa(mapa))
    return redirect(f"/mapa/{mapa.id}")


@charts_bp.delete("/<int:mapa_id>")
def excluir(mapa_id):
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para excluir um mapa."), 401

    mapas = _mapas_concluidos_do_usuario(session["usuario_id"])
    mapa_principal = mapas.first()
    mapa = mapas.filter(MapaNatal.id == mapa_id).first()
    if mapa is None:
        return jsonify(erro="Mapa não encontrado."), 404
    if mapa_principal is not None and mapa.id == mapa_principal.id:
        return jsonify(erro="O mapa principal não pode ser excluído."), 409

    try:
        mapa.status = "excluido"
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Falha ao excluir mapa natal")
        return jsonify(erro="Não foi possível excluir o mapa."), 500

    return jsonify(ok=True, id=mapa.id, status=mapa.status)


@charts_bp.get("/principal/interpretacoes")
def interpretacoes():
    if request.accept_mimetypes.best == "application/json":
        if "usuario_id" not in session:
            return jsonify(erro="Faça login para acessar as interpretações."), 401
        try:
            resposta, veio_do_cache = obter_interpretacoes(
                session["usuario_id"],
                forcar=request.args.get("forcar", "").casefold() in {"1", "true", "sim"},
            )
            return jsonify(**resposta, cache=veio_do_cache)
        except MapaInterpretacaoNaoEncontrado as erro:
            return jsonify(erro=str(erro), codigo="mapa_principal_ausente"), 404
        except (ModeloConfigError, OpenRouterConfigurationError) as erro:
            current_app.logger.warning("Configuração do agente de interpretação inválida: %s", erro)
            return jsonify(erro="O agente de interpretação não está configurado."), 503
        except (InterpretacaoError, OpenRouterResponseError) as erro:
            current_app.logger.warning("Falha no agente de interpretação: %s", erro)
            return jsonify(
                erro="As interpretações estão temporariamente indisponíveis. Tente novamente em instantes."
            ), 502
        except Exception:
            current_app.logger.exception("Falha inesperada ao gerar interpretações")
            return jsonify(erro="Não foi possível gerar as interpretações."), 500
    return servir_spa()


@charts_bp.get("/principal/asteroides")
def asteroides():
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para acessar os asteroides."), 401
    mapa = _mapas_concluidos_do_usuario(session["usuario_id"]).first()
    if mapa is None:
        return jsonify(erro="Crie seu mapa principal primeiro.", codigo="mapa_principal_ausente"), 404
    try:
        return jsonify(mapa={"id": mapa.id, "nome": mapa.nome}, asteroides=calcular_asteroides_mapa(mapa))
    except AsteroideCalculoError as erro:
        return jsonify(erro=str(erro)), 422


@charts_bp.get("/<int:mapa_id>/asteroides")
def asteroides_por_mapa(mapa_id):
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para acessar os asteroides."), 401
    mapa = _mapa_concluido_do_usuario(mapa_id, session["usuario_id"])
    if mapa is None:
        return jsonify(erro="Mapa não encontrado."), 404
    try:
        return jsonify(mapa={"id": mapa.id, "nome": mapa.nome}, asteroides=calcular_asteroides_mapa(mapa))
    except AsteroideCalculoError as erro:
        return jsonify(erro=str(erro)), 422


@charts_bp.get("/principal/exportacao")
def exportar_principal():
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para exportar seu mapa."), 401
    if request.args.get("formato", "pdf").casefold() != "pdf":
        return jsonify(erro="O formato disponível para exportação é PDF."), 400
    mapa = _mapas_concluidos_do_usuario(session["usuario_id"]).first()
    if mapa is None:
        return jsonify(erro="Crie seu mapa principal primeiro.", codigo="mapa_principal_ausente"), 404
    try:
        conteudo = gerar_relatorio_pdf(mapa)
    except RelatorioMuitoGrandeError as erro:
        return jsonify(erro=str(erro)), 413
    nome = _nome_arquivo_pdf(mapa.nome)
    return send_file(
        BytesIO(conteudo),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=nome,
        max_age=0,
    )


@charts_bp.get("/<int:mapa_id>/exportacao")
def exportar_mapa(mapa_id):
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para exportar seu mapa."), 401
    if request.args.get("formato", "pdf").casefold() != "pdf":
        return jsonify(erro="O formato disponível para exportação é PDF."), 400
    mapa = _mapa_concluido_do_usuario(mapa_id, session["usuario_id"])
    if mapa is None:
        return jsonify(erro="Mapa não encontrado."), 404
    try:
        conteudo = gerar_relatorio_pdf(mapa)
    except RelatorioMuitoGrandeError as erro:
        return jsonify(erro=str(erro)), 413
    return send_file(
        BytesIO(conteudo),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=_nome_arquivo_pdf(mapa.nome),
        max_age=0,
    )


@charts_bp.get("/processando")
def processando():
    return redirect("/carregando")


def _serializar_mapa(mapa):
    return {
        "id": mapa.id,
        "nome": mapa.nome,
        "data_nascimento": mapa.data_nascimento.isoformat(),
        "horario_nascimento": mapa.horario_nascimento.isoformat(),
        "local_nascimento": mapa.local_nascimento,
        "cidade_ibge": mapa.cidade_ibge,
        "pais_codigo": mapa.pais_codigo or "BR",
        "geoname_id": mapa.geoname_id,
        "latitude": mapa.latitude,
        "longitude": mapa.longitude,
        "timezone_id": mapa.timezone_id,
        "utc_offset_minutos": mapa.utc_offset_minutos,
        "status": mapa.status,
        "dados": enriquecer_dados_mapa(mapa.dados),
    }


def _serializar_resumo_mapa(mapa, principal_id):
    dados = mapa.dados or {}
    planetas = dados.get("planetas") or []
    sol = next((planeta for planeta in planetas if planeta.get("nome") == "Sol"), {})
    ascendente = dados.get("ascendente") or {}

    return {
        "id": mapa.id,
        "nome": mapa.nome,
        "data_nascimento": mapa.data_nascimento.isoformat(),
        "horario_nascimento": mapa.horario_nascimento.strftime("%H:%M"),
        "local_nascimento": mapa.local_nascimento,
        "status": mapa.status,
        "criado_em": mapa.criado_em.isoformat(),
        "principal": mapa.id == principal_id,
        "resumo": {
            "sol_signo": sol.get("signo"),
            "sol_posicao": sol.get("posicao"),
            "ascendente_signo": ascendente.get("signo"),
            "ascendente_posicao": ascendente.get("posicao"),
        },
    }
