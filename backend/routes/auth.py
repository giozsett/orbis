from flask import Blueprint, jsonify, render_template, request


auth_bp = Blueprint("auth", __name__, url_prefix="/acesso")


@auth_bp.get("")
def acesso():
    return render_template("loginCadastro.html")


@auth_bp.post("/login")
def login():
    if not request.form.get("email") or not request.form.get("senha"):
        return jsonify(erro="E-mail e senha são obrigatórios."), 400

    return jsonify(
        erro="A autenticação ainda não foi configurada.",
        proxima_etapa="Criar o modelo Usuario e validar a senha com hash.",
    ), 501


@auth_bp.post("/cadastro")
def cadastro():
    campos = ("nome", "email", "senha")
    if any(not request.form.get(campo) for campo in campos):
        return jsonify(erro="Nome, e-mail e senha são obrigatórios."), 400

    return jsonify(
        erro="O cadastro ainda não foi configurado.",
        proxima_etapa="Persistir o usuário no SQLite com a senha protegida.",
    ), 501
