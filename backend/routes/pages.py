from flask import Blueprint, redirect, request, session

from backend.app.frontend import servir_spa
from backend.models.mapa_natal import MapaNatal


pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def index():
    return redirect("/dashboard" if session.get("usuario_id") else "/login")


@pages_bp.get("/dashboard")
def dashboard():
    # Compatibilidade com consumidores legados que não negociam HTML.
    if request.accept_mimetypes.best != "text/html" and session.get("usuario_id"):
        possui_mapa = MapaNatal.query.filter_by(
            usuario_id=session["usuario_id"], status="concluido"
        ).first() is not None
        if possui_mapa:
            return redirect("/mapas")
    return servir_spa()
