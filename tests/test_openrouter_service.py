from backend.services.openrouter_service import completar


class RespostaFake:
    is_error = False

    def json(self):
        return {"choices": [{"message": {"content": "resposta"}}]}


class ClienteFake:
    def __init__(self, capturado, **_kwargs):
        self.capturado = capturado

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def post(self, url, **kwargs):
        self.capturado.update(url=url, **kwargs)
        return RespostaFake()


def test_envia_lista_de_fallbacks_ao_openrouter(app, monkeypatch):
    capturado = {}
    monkeypatch.setattr(
        "backend.services.openrouter_service.httpx.Client",
        lambda **kwargs: ClienteFake(capturado, **kwargs),
    )

    with app.app_context():
        app.config["OPENROUTER_API_KEY"] = "sk-or-teste"
        resposta = completar(
            [{"role": "user", "content": "olá"}],
            "modelo/primario:free",
            modelos_fallback=["openrouter/free"],
        )

    assert resposta == "resposta"
    assert capturado["json"]["models"] == [
        "modelo/primario:free", "openrouter/free",
    ]
    assert "model" not in capturado["json"]
