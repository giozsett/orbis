from flask import Blueprint, jsonify, redirect, render_template, request, session, url_for
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from backend.app.database import db
from backend.models.mapa_natal import MapaNatal
from backend.models.usuario import Usuario
from backend.app.frontend import servir_spa


auth_bp = Blueprint("auth", __name__, url_prefix="/acesso")


def _is_ajax():
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


@auth_bp.get("")
def acesso():
    return redirect("/login")


@auth_bp.get("/sessao")
def estado_sessao():
    usuario_id = session.get("usuario_id")
    usuario = db.session.get(Usuario, usuario_id) if usuario_id else None
    if usuario is None:
        if usuario_id:
            session.clear()
        return jsonify(autenticado=False)
    return jsonify(
        autenticado=True,
        usuario={"id": usuario.id, "nome": usuario.nome, "email": usuario.email},
    )


@auth_bp.post("/login")
def login():
    email = request.form.get("email", "").strip()
    senha = request.form.get("senha", "")

    if not email or not senha:
        if _is_ajax():
            return jsonify(erro="E-mail e senha são obrigatórios."), 400
        return render_template("loginCadastro.html", erro="E-mail e senha são obrigatórios.")

    usuario = Usuario.query.filter_by(email=email).first()

    if usuario is None or not check_password_hash(usuario.senha_hash, senha):
        if _is_ajax():
            return jsonify(erro="E-mail ou senha inválidos."), 401
        return render_template("loginCadastro.html", erro="E-mail ou senha inválidos.")

    session.clear()
    session.permanent = request.form.get("manter_conectado", "true").casefold() != "false"
    session["usuario_id"] = usuario.id
    session["usuario_nome"] = usuario.nome

    if _is_ajax():
        return jsonify(ok=True, redirect=url_for("pages.dashboard"))
    return redirect(url_for("pages.dashboard"))


@auth_bp.post("/cadastro")
def cadastro():
    nome = request.form.get("nome", "").strip()
    email = request.form.get("email", "").strip()
    senha = request.form.get("senha", "")
    confirmacao_senha = request.form.get("confirmacao_senha", "")

    if not nome or not email or not senha or not confirmacao_senha:
        if _is_ajax():
            return jsonify(erro="Nome, e-mail, senha e confirmação são obrigatórios."), 400
        return render_template("loginCadastro.html", erro="Nome, e-mail, senha e confirmação são obrigatórios.")

    if senha != confirmacao_senha:
        if _is_ajax():
            return jsonify(erro="As senhas não coincidem."), 400
        return render_template("loginCadastro.html", erro="As senhas não coincidem."), 400

    if len(senha) < 6:
        if _is_ajax():
            return jsonify(erro="A senha deve ter pelo menos 6 caracteres."), 400
        return render_template("loginCadastro.html", erro="A senha deve ter pelo menos 6 caracteres.")

    usuario = Usuario(
        nome=nome,
        email=email,
        senha_hash=generate_password_hash(senha),
    )

    try:
        db.session.add(usuario)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        if _is_ajax():
            return jsonify(erro="Este e-mail já está cadastrado."), 409
        return render_template("loginCadastro.html", erro="Este e-mail já está cadastrado.")

    session.clear()
    session.permanent = True
    session["usuario_id"] = usuario.id
    session["usuario_nome"] = usuario.nome

    if _is_ajax():
        return jsonify(ok=True, redirect=url_for("pages.dashboard"))
    return redirect(url_for("pages.dashboard"))


@auth_bp.post("/recuperar-senha/verificar-email")
def verificar_email_recuperacao():
    email = request.form.get("email", "").strip()
    if not email:
        return jsonify(erro="Informe o e-mail cadastrado."), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if usuario is None:
        return jsonify(erro="Não encontramos uma conta com este e-mail."), 404

    return jsonify(ok=True)


@auth_bp.post("/recuperar-senha/redefinir")
def redefinir_senha():
    email = request.form.get("email", "").strip()
    nova_senha = request.form.get("nova_senha", "")
    confirmacao_senha = request.form.get("confirmacao_senha", "")

    if not email or not nova_senha or not confirmacao_senha:
        return jsonify(erro="E-mail, nova senha e confirmação são obrigatórios."), 400
    if len(nova_senha) < 6:
        return jsonify(erro="A nova senha deve ter pelo menos 6 caracteres."), 400
    if nova_senha != confirmacao_senha:
        return jsonify(erro="As senhas não coincidem."), 400

    usuario = Usuario.query.filter_by(email=email).first()
    if usuario is None:
        return jsonify(erro="Não encontramos uma conta com este e-mail."), 404

    usuario.senha_hash = generate_password_hash(nova_senha)
    db.session.commit()
    return jsonify(ok=True, mensagem="Senha alterada com sucesso.")


@auth_bp.get("/logout")
def logout():
    session.clear()
    return redirect("/login")


@auth_bp.post("/logout")
def logout_json():
    session.clear()
    return jsonify(ok=True, redirect="/login")


@auth_bp.get("/perfil")
def perfil():
    usuario_id = session.get("usuario_id")
    if usuario_id is None:
        return jsonify(erro="Faça login para acessar seu perfil."), 401

    usuario = db.session.get(Usuario, usuario_id)
    if usuario is None:
        session.clear()
        return jsonify(erro="Usuário não encontrado."), 404

    return jsonify(usuario={
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "criado_em": usuario.criado_em.isoformat(),
        "atualizado_em": usuario.atualizado_em.isoformat(),
        "total_mapas": MapaNatal.query.filter_by(
            usuario_id=usuario.id,
            status="concluido",
        ).count(),
    })
