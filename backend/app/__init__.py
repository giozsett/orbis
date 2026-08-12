from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, render_template, request


project_root = Path(__file__).resolve().parents[2]
load_dotenv(project_root / ".env")

from backend.app.config import Config
from backend.app.database import db


def create_app(config_object=Config):
    """Cria e configura a aplicação Flask."""

    app = Flask(
        __name__,
        template_folder=str(project_root / "frontend" / "templates"),
        static_folder=str(project_root / "frontend" / "dist" / "assets"),
        static_url_path="/assets",
    )
    app.config.from_object(config_object)

    db.init_app(app)

    from backend.models import Usuario, MapaNatal, ChatMensagem, ChatDia, Interpretation

    with app.app_context():
        db.create_all()
        from backend.app.schema_upgrade import aplicar_atualizacoes_aditivas

        aplicar_atualizacoes_aditivas()

    from backend.routes.auth import auth_bp
    from backend.routes.charts import charts_bp
    from backend.routes.chat import chat_bp
    from backend.routes.horoscopo import horoscopo_bp
    from backend.routes.localizacoes import localizacoes_bp
    from backend.routes.pages import pages_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(charts_bp)
    app.register_blueprint(horoscopo_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(localizacoes_bp)

    @app.errorhandler(404)
    def pagina_nao_encontrada(_error):
        from backend.app.frontend import eh_rota_spa, servir_spa

        if request.method == "GET" and eh_rota_spa(request.path):
            return servir_spa()
        return render_template("erro.html"), 404

    @app.errorhandler(500)
    def erro_interno(_error):
        return render_template("erro.html"), 500

    return app
