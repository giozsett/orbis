import pytest

from backend.app import create_app
from backend.app.database import db
from backend.app.config import TestingConfig


@pytest.fixture()
def app():
    app = create_app(TestingConfig)
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()
