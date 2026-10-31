from backend.services.relatorio_pdf_service import CartaArcanoVetorial


class CanvasEspiao:
    def __init__(self):
        self.textos = []
        self.fontes = []

    def __getattr__(self, nome):
        if nome == "setFont":
            return lambda fonte, tamanho: self.fontes.append((fonte, tamanho))
        if nome == "drawCentredString":
            return lambda x, y, texto: self.textos.append(texto)
        return lambda *args, **kwargs: None


def test_carta_arcano_desenha_simbolo_no_pdf():
    carta = CartaArcanoVetorial({
        "numero": 9,
        "nome": "O Eremita",
        "simbolo": "✧",
        "cores": ["#d7c98d", "#58627f", "#101624"],
    })
    canvas = CanvasEspiao()
    carta.canv = canvas

    carta.draw()

    assert canvas.textos == ["9", "✧", "O EREMITA"]
    assert any(tamanho == 38 for _, tamanho in canvas.fontes)


def test_relatorio_inclui_arcanos_e_matriz_do_destino():
    from datetime import date, time

    from reportlab.platypus import Paragraph

    from backend.models.mapa_natal import MapaNatal
    from backend.services.relatorio_pdf_service import (
        MatrizDestinoVetorial,
        _capitulo_tarot,
        _estilos,
        gerar_relatorio_pdf,
    )

    mapa = MapaNatal(
        nome="Mapa de teste",
        data_nascimento=date(1985, 12, 31),
        horario_nascimento=time(10, 30),
        local_nascimento="São Paulo, SP",
        dados={"planetas": [], "casas": [], "aspectos": []},
        status="concluido",
    )
    capitulo = _capitulo_tarot(mapa, _estilos(), 170, 2026)
    textos = " ".join(item.getPlainText() for item in capitulo if isinstance(item, Paragraph))

    assert any(isinstance(item, MatrizDestinoVetorial) for item in capitulo)
    assert "Seus arcanos" in textos and "Matriz do destino" in textos
    assert gerar_relatorio_pdf(mapa, ano=2026).startswith(b"%PDF")
