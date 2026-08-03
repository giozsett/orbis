from flask import Blueprint, current_app, jsonify, render_template, request, session

from backend.services.horoscopo_service import (
    HoroscopoGeracaoError,
    MapaPrincipalNaoEncontrado,
    PeriodoInvalido,
    gerar_horoscopo,
    listar_horoscopos,
)
from backend.services.openrouter_service import (
    OpenRouterConfigurationError,
    OpenRouterResponseError,
)


horoscopo_bp = Blueprint("horoscopo", __name__, url_prefix="/horoscopo")


@horoscopo_bp.get("")
def pagina():
    if request.accept_mimetypes.best == "application/json":
        if "usuario_id" not in session:
            return jsonify(erro="Faça login para acessar seu horóscopo."), 401
        try:
            return jsonify(listar_horoscopos(session["usuario_id"]))
        except MapaPrincipalNaoEncontrado as erro:
            return jsonify(erro=str(erro), codigo="mapa_principal_ausente"), 404
    return render_template("horoscopoPersonalizado.html")


@horoscopo_bp.post("/gerar")
def gerar():
    if "usuario_id" not in session:
        return jsonify(erro="Faça login para gerar seu horóscopo."), 401
    if not request.is_json:
        return jsonify(erro="Envie os dados como JSON."), 415

    entrada = request.get_json(silent=True) or {}
    periodo = str(entrada.get("periodo", "diario")).strip().casefold()
    forcar = entrada.get("forcar", False) is True

    try:
        horoscopo, cache = gerar_horoscopo(
            session["usuario_id"],
            periodo,
            forcar=forcar,
        )
        return jsonify(horoscopo=horoscopo, cache=cache)
    except PeriodoInvalido as erro:
        return jsonify(erro=str(erro)), 400
    except MapaPrincipalNaoEncontrado as erro:
        return jsonify(erro=str(erro), codigo="mapa_principal_ausente"), 404
    except OpenRouterConfigurationError as erro:
        return jsonify(erro=str(erro), codigo="openrouter_nao_configurado"), 503
    except (OpenRouterResponseError, HoroscopoGeracaoError) as erro:
        current_app.logger.warning("Falha na geração do horóscopo: %s", erro)
        return jsonify(
            erro="Não foi possível gerar este ciclo agora. Tente novamente em instantes.",
            codigo="falha_geracao",
        ), 502
    except Exception:
        current_app.logger.exception("Falha inesperada ao gerar horóscopo")
        return jsonify(erro="Não foi possível salvar o horóscopo."), 500
