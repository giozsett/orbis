from werkzeug.security import check_password_hash, generate_password_hash

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


def test_cadastro_exige_confirmacao_de_senha(client):
    response = client.post(
        "/acesso/cadastro",
        data={
            "nome": "Nova pessoa",
            "email": "nova@orbis.local",
            "senha": "segredo123",
        },
        headers={"X-Requested-With": "XMLHttpRequest"},
    )

    assert response.status_code == 400
    assert "confirmação" in response.get_json()["erro"]


def test_cadastro_rejeita_senhas_diferentes(client, app):
    response = client.post(
        "/acesso/cadastro",
        data={
            "nome": "Nova pessoa",
            "email": "nova@orbis.local",
            "senha": "segredo123",
            "confirmacao_senha": "outra-senha",
        },
        headers={"X-Requested-With": "XMLHttpRequest"},
    )

    assert response.status_code == 400
    assert response.get_json()["erro"] == "As senhas não coincidem."
    with app.app_context():
        assert Usuario.query.filter_by(email="nova@orbis.local").first() is None


def test_cadastro_aceita_senhas_iguais(client, app):
    response = client.post(
        "/acesso/cadastro",
        data={
            "nome": "Nova pessoa",
            "email": "nova@orbis.local",
            "senha": "segredo123",
            "confirmacao_senha": "segredo123",
        },
        headers={"X-Requested-With": "XMLHttpRequest"},
    )

    assert response.status_code == 200
    with app.app_context():
        assert Usuario.query.filter_by(email="nova@orbis.local").first() is not None


def test_recuperacao_informa_quando_email_nao_existe(client):
    response = client.post(
        "/acesso/recuperar-senha/verificar-email",
        data={"email": "inexistente@orbis.local"},
    )

    assert response.status_code == 404


def test_recuperacao_rejeita_novas_senhas_diferentes(client, app):
    _criar_usuario(app)
    response = client.post(
        "/acesso/recuperar-senha/redefinir",
        data={
            "email": "giovana@orbis.local",
            "nova_senha": "novaSenha123",
            "confirmacao_senha": "senhaDiferente",
        },
    )

    assert response.status_code == 400
    assert response.get_json()["erro"] == "As senhas não coincidem."


def test_recuperacao_altera_senha_existente(client, app):
    _criar_usuario(app)
    assert client.post(
        "/acesso/recuperar-senha/verificar-email",
        data={"email": "giovana@orbis.local"},
    ).status_code == 200

    response = client.post(
        "/acesso/recuperar-senha/redefinir",
        data={
            "email": "giovana@orbis.local",
            "nova_senha": "novaSenha123",
            "confirmacao_senha": "novaSenha123",
        },
    )

    assert response.status_code == 200
    with app.app_context():
        usuario = Usuario.query.filter_by(email="giovana@orbis.local").first()
        assert check_password_hash(usuario.senha_hash, "novaSenha123")
