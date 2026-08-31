"""Entrega do bundle React pelo Flask em produção."""

from pathlib import Path

from flask import current_app, render_template, send_from_directory


DIST_FRONTEND = Path(__file__).resolve().parents[2] / "frontend" / "dist"
ROTAS_SPA = {
    "/login", "/dashboard", "/criar-mapa", "/meus-mapas", "/mapa",
    "/interpretacoes", "/horoscopo", "/horoscopos-malucos", "/chat", "/carregando", "/perfil",
}


def eh_rota_spa(caminho: str) -> bool:
    return caminho in ROTAS_SPA or caminho.startswith("/mapa/")


def servir_spa():
    indice = DIST_FRONTEND / "index.html"
    if indice.is_file():
        return send_from_directory(DIST_FRONTEND, "index.html")
    current_app.logger.warning(
        "Bundle React ausente em %s. Execute `npm run build` em frontend/.",
        DIST_FRONTEND,
    )
    return render_template("erro.html"), 503
