from werkzeug.security import generate_password_hash

from backend.app.database import db
from backend.models.usuario import Usuario


def _criar_usuario(app):
    with app.app_context():
        usuario = Usuario(
            nome="Giovana Teste",
            email="giovana@orbis.local",
            senha_hash=generate_password_hash("segredo123"),
        )
        db.session.add(usuario)
        db.session.commit()
        return usuario.id


def test_perfil_exige_sessao(client):
    assert client.get("/acesso/perfil").status_code == 401


def test_perfil_retorna_apenas_dados_seguros(client, app):
    usuario_id = _criar_usuario(app)
    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    response = client.get("/acesso/perfil")
    assert response.status_code == 200
    usuario = response.get_json()["usuario"]
    assert usuario["nome"] == "Giovana Teste"
    assert usuario["email"] == "giovana@orbis.local"
    assert "senha_hash" not in usuario


def test_logout_post_encerra_sessao(client, app):
    usuario_id = _criar_usuario(app)
    with client.session_transaction() as sessao:
        sessao["usuario_id"] = usuario_id

    response = client.post("/acesso/logout")
    assert response.status_code == 200
    assert response.get_json()["redirect"] == "/login"
    assert client.get("/acesso/perfil").status_code == 401
