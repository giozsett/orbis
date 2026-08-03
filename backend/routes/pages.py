from flask import Blueprint, redirect, render_template, session, url_for

from backend.models.mapa_natal import MapaNatal


pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def index():
    return redirect(url_for("auth.acesso"))


@pages_bp.get("/dashboard")
def dashboard():
    if "usuario_id" not in session:
        return redirect(url_for("auth.acesso"))

    possui_mapa = MapaNatal.query.filter_by(
        usuario_id=session["usuario_id"],
        status="concluido",
    ).first() is not None
    if possui_mapa:
        return redirect(url_for("charts.listar"))

    return render_template("inicieSuaJornada.html")
