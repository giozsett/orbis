import os
from pathlib import Path


basedir = Path(__file__).resolve().parents[2]


class Config:
    """Configuração base da aplicação."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-change-me")
    JSON_SORT_KEYS = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{basedir / 'orbis.db'}"
    )


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
