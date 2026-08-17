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
