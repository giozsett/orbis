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


def test_estado_da_sessao_informa_quando_usuario_nao_esta_autenticado(client):
    response = client.get("/acesso/sessao")

    assert response.status_code == 200
    assert response.get_json() == {"autenticado": False}


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


def test_login_cria_cookie_persistente_e_raiz_reabre_dashboard(client, app):
    usuario_id = _criar_usuario(app)

    response = client.post(
        "/acesso/login",
        data={
            "email": "giovana@orbis.local",
            "senha": "segredo123",
            "manter_conectado": "true",
        },
        headers={"X-Requested-With": "XMLHttpRequest"},
    )

    assert response.status_code == 200
    assert "Expires=" in response.headers["Set-Cookie"]
    with client.session_transaction() as sessao:
        assert sessao["usuario_id"] == usuario_id
        assert sessao.permanent is True
    assert client.get("/acesso/sessao").get_json()["autenticado"] is True
    assert client.get("/").headers["Location"].endswith("/dashboard")
