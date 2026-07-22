from pathlib import Path

from flask import Flask, render_template

from backend.app.config import Config
from backend.app.database import db


def create_app(config_object=Config):
    """Cria e configura a aplicação Flask."""

    project_root = Path(__file__).resolve().parents[2]
    app = Flask(
        __name__,
        template_folder=str(project_root / "frontend" / "templates"),
        static_folder=str(project_root / "frontend" / "static"),
        static_url_path="/static",
    )
    app.config.from_object(config_object)

    db.init_app(app)

    from backend.models import Usuario, MapaNatal, ChatMensagem, Interpretation

    with app.app_context():
        db.create_all()

    from backend.routes.auth import auth_bp
    from backend.routes.charts import charts_bp
    from backend.routes.chat import chat_bp
    from backend.routes.horoscopo import horoscopo_bp
    from backend.routes.pages import pages_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(charts_bp)
    app.register_blueprint(horoscopo_bp)
    app.register_blueprint(chat_bp)

    @app.errorhandler(404)
    def pagina_nao_encontrada(_error):
        return render_template("erro.html"), 404

    @app.errorhandler(500)
    def erro_interno(_error):
        return render_template("erro.html"), 500

    return app
