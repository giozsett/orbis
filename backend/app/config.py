import os
from datetime import timedelta
from pathlib import Path


basedir = Path(__file__).resolve().parents[2]


class Config:
    """Configuração base da aplicação."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-change-me")
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    JSON_SORT_KEYS = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL = os.getenv(
        "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
    )
    OPENROUTER_TIMEOUT_SECONDS = float(
        os.getenv("OPENROUTER_TIMEOUT_SECONDS", "30")
    )
    OPENROUTER_APP_NAME = os.getenv("OPENROUTER_APP_NAME", "ORBIS")
    OPENROUTER_APP_URL = os.getenv("OPENROUTER_APP_URL", "")
    HOROSCOPO_TIMEZONE = os.getenv("HOROSCOPO_TIMEZONE", "America/Sao_Paulo")


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{basedir / 'orbis.db'}"
    )


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
