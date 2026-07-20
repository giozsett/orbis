from flask import Blueprint, redirect, render_template, url_for


pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def index():
    return redirect(url_for("auth.acesso"))


@pages_bp.get("/dashboard")
def dashboard():
    # Estado vazio do dashboard, usado enquanto o usuário não possui mapas.
    return render_template("inicieSuaJornada.html")
