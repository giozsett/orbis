import os


class Config:
    """Configuração base da aplicação."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-change-me")
    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
