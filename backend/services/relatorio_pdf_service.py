"""Relatório vetorial e compacto do mapa natal principal."""

from io import BytesIO
from math import cos, pi, radians, sin
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    CondPageBreak,
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from backend.models.mapa_natal import MapaNatal
from backend.services.arcano_pessoal_service import obter_arcano_pessoal


TAMANHO_MAXIMO_PDF = 15 * 1024 * 1024
CAMINHOS_FONTE = [Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"), Path("C:/Windows/Fonts/arial.ttf")]
CAMINHOS_FONTE_NEGRITO = [Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"), Path("C:/Windows/Fonts/arialbd.ttf")]
CAMINHOS_FONTE_SIGNOS = [Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"), Path("C:/Windows/Fonts/seguisym.ttf")]
FONTE = "Helvetica"
FONTE_NEGRITO = "Helvetica-Bold"
FONTE_SIGNOS = "Helvetica"

# Paleta do ORBIS: fundo noturno para a mandala, tinta escura para o papel
NOITE = "#0b1323"
NOITE_PROFUNDA = "#060e1d"
ROSA = "#ffb1c3"
ROSA_INTENSO = "#ff4b89"
LILAS = "#b86dfd"
TINTA = "#1d2433"
TINTA_SUAVE = "#5b6273"
ACENTO = "#c2185b"
LINHA = "#ecdde4"
FUNDO_SUAVE = "#fbf6f9"

ELEMENTOS = {"fogo": "#ff8fa8", "terra": "#d9b06b", "ar": "#deb7ff", "agua": "#9cc4ff"}
NOMES_ELEMENTOS = {"fogo": "Fogo", "terra": "Terra", "ar": "Ar", "agua": "Água"}
MODALIDADES = ("Cardinal", "Fixo", "Mutável")
SIGNOS = [
    ("Áries", "♈", "fogo"), ("Touro", "♉", "terra"), ("Gêmeos", "♊", "ar"),
    ("Câncer", "♋", "agua"), ("Leão", "♌", "fogo"), ("Virgem", "♍", "terra"),
    ("Libra", "♎", "ar"), ("Escorpião", "♏", "agua"), ("Sagitário", "♐", "fogo"),
    ("Capricórnio", "♑", "terra"), ("Aquário", "♒", "ar"), ("Peixes", "♓", "agua"),
]
SIMBOLO_SIGNO = {nome: simbolo for nome, simbolo, _ in SIGNOS}
ELEMENTO_SIGNO = {nome: elemento for nome, _, elemento in SIGNOS}
MODALIDADE_SIGNO = {nome: MODALIDADES[indice % 3] for indice, (nome, _, _) in enumerate(SIGNOS)}

# Mesma paleta da mandala web
CORES_PLANETAS = {
    "Sol": "#ffd16a", "Lua": "#d9c5ff", "Mercúrio": "#9cd7ee",
    "Vênus": "#ff9ec1", "Marte": "#ff897d", "Júpiter": "#c997ff",
    "Saturno": "#d3b99d", "Urano": "#87dfd8", "Netuno": "#76b9ff",
    "Plutão": "#e3a8c6", "Nodo Norte": "#f1d6aa",
}
SIMBOLOS_PLANETAS = {
    "Sol": "☉", "Lua": "☽", "Mercúrio": "☿", "Vênus": "♀", "Marte": "♂",
    "Júpiter": "♃", "Saturno": "♄", "Urano": "♅", "Netuno": "♆",
    "Plutão": "♇", "Nodo Norte": "☊",
}
# [cor sobre o fundo escuro, cor sobre o papel, símbolo, natureza, tracejado]
ASPECTOS = {
    "conjunção": ("#ffd16a", "#b7860f", "☌", "Neutro", False),
    "sextil": ("#9cc4ff", "#3a72c4", "⚹", "Harmônico", False),
    "trígono": ("#87dfd8", "#1d8f82", "△", "Harmônico", False),
    "quadratura": ("#ff4b89", "#d81b60", "□", "Tenso", True),
    "oposição": ("#ff897d", "#d6452f", "☍", "Tenso", True),
}
SEPARACAO_MINIMA = 9.0


class RelatorioPdfError(RuntimeError):
    pass


class RelatorioMuitoGrandeError(RelatorioPdfError):
    pass


def _registrar_fontes():
    global FONTE, FONTE_NEGRITO, FONTE_SIGNOS
    caminho = next((item for item in CAMINHOS_FONTE if item.exists()), None)
    caminho_negrito = next((item for item in CAMINHOS_FONTE_NEGRITO if item.exists()), None)
    caminho_signos = next((item for item in CAMINHOS_FONTE_SIGNOS if item.exists()), None)
    if caminho and "OrbisSans" not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont("OrbisSans", str(caminho)))
    if caminho_negrito and "OrbisSansBold" not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont("OrbisSansBold", str(caminho_negrito)))
    if caminho_signos and "OrbisSymbols" not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont("OrbisSymbols", str(caminho_signos)))
    if caminho:
        FONTE = "OrbisSans"
    if caminho_negrito:
        FONTE_NEGRITO = "OrbisSansBold"
    if caminho_signos:
        FONTE_SIGNOS = "OrbisSymbols"


def _misturar(cor: str, fundo: str, proporcao: float) -> colors.Color:
    """Mistura `cor` sobre `fundo` (0 = só fundo, 1 = só cor)."""
    a, b = colors.HexColor(cor), colors.HexColor(fundo)
    return colors.Color(
        b.red + (a.red - b.red) * proporcao,
        b.green + (a.green - b.green) * proporcao,
        b.blue + (a.blue - b.blue) * proporcao,
    )


def _no_papel(cor: str) -> colors.Color:
    """Escurece as cores pensadas para o fundo noturno para lê-las no papel."""
    return _misturar(cor, "#000000", 0.62)


def _hex(cor: colors.Color) -> str:
    return "#" + cor.hexval()[2:]


def _meios_das_casas(casas: list[dict]) -> list[tuple[int, float]]:
    cuspides = [float(casa.get("grau", indice * 30)) % 360 for indice, casa in enumerate(casas[:12])]
    if len(cuspides) != 12:
        cuspides = [indice * 30.0 for indice in range(12)]
    return [
        (indice + 1, (grau + ((cuspides[(indice + 1) % 12] - grau) % 360) / 2) % 360)
        for indice, grau in enumerate(cuspides)
    ]


def _espalhar_posicoes(graus: list[float], minimo: float = SEPARACAO_MINIMA) -> list[float]:
    """Afasta glifos próximos mantendo a ordem zodiacal (igual à mandala web)."""
    n = len(graus)
    if n < 2 or n * minimo >= 360:
        return list(graus)
    ordem = sorted(((grau % 360, indice) for indice, grau in enumerate(graus)))
    pos = [grau for grau, _ in ordem]
    for _ in range(120):
        moveu = False
        for i in range(n):
            j = (i + 1) % n
            vao = pos[0] + 360 - pos[-1] if j == 0 else pos[j] - pos[i]
            if vao < minimo - 0.01:
                ajuste = (minimo - vao) / 2
                pos[i] -= ajuste
                pos[j] += ajuste
                moveu = True
        if not moveu:
            break
    resultado = [0.0] * n
    for (_, indice), valor in zip(ordem, pos):
        resultado[indice] = valor
    return resultado


def _grau_e_minutos(planeta: dict) -> tuple[str, str]:
    valor = float(planeta.get("grau_signo", float(planeta.get("grau", 0)) % 30))
    graus = int(valor)
    minutos = int((valor - graus) * 60)
    return f"{graus}°", f"{minutos:02d}′"


def _texto_central(canvas, x, y, texto, fonte, tamanho, cor):
    """Centraliza o texto também na vertical (drawCentredString usa a linha de base)."""
    canvas.setFillColor(cor if isinstance(cor, colors.Color) else colors.HexColor(cor))
    canvas.setFont(fonte, tamanho)
    canvas.drawCentredString(x, y - tamanho * 0.35, texto)


def _texto_espacado(canvas, x, y, texto, fonte, tamanho, cor, espaco=1.6):
    objeto = canvas.beginText(x, y)
    objeto.setFont(fonte, tamanho)
    objeto.setCharSpace(espaco)
    objeto.setFillColor(colors.HexColor(cor))
    objeto.textOut(texto)
    # o espaçamento fica no estado gráfico; zera para não vazar nos próximos textos
    objeto.setCharSpace(0)
    canvas.drawText(objeto)


def _marca(canvas, x, y, tamanho, cor, espaco):
    """✦ ORBIS — a estrela vem da fonte de símbolos, que tem o glifo."""
    canvas.setFillColor(colors.HexColor(cor))
    canvas.setFont(FONTE_SIGNOS, tamanho)
    canvas.drawString(x, y, "✦")
    _texto_espacado(canvas, x + tamanho * 1.35, y, "ORBIS", FONTE_NEGRITO, tamanho, cor, espaco)


class MandalaVetorial(Flowable):
    """Roda do mapa natal: Ascendente à esquerda, zodíaco no sentido anti-horário.

    Anéis, de fora para dentro: faixa zodiacal, régua de graus, planetas
    (glifo e grau, espalhados para não colidirem), casas e aspectos no miolo.
    """

    def __init__(self, dados: dict, tamanho: float = 176 * mm):
        super().__init__()
        self.dados = dados
        self.width = tamanho
        self.height = tamanho

    def draw(self):
        _registrar_fontes()
        canvas = self.canv
        lado = self.width
        c = lado / 2
        R = lado * 0.42
        escala = R / 232  # proporção em relação à mandala web
        raio = {
            "zodiaco_interno": R * 0.84, "glifo_signo": R * 0.92,
            "planeta_traco": R * 0.8, "planeta_glifo": R * 0.725, "planeta_grau": R * 0.625,
            "casas_externo": R * 0.565, "casas_numero": R * 0.5, "casas_interno": R * 0.435,
        }
        ascendente = float((self.dados.get("ascendente") or {}).get("grau", 0))

        def angulo(grau):
            return radians(180 + grau - ascendente)

        def ponto(grau, r):
            return c + r * cos(angulo(grau)), c + r * sin(angulo(grau))

        # Painel noturno com a aurora do ORBIS no canto
        canvas.saveState()
        caminho = canvas.beginPath()
        caminho.roundRect(0, 0, lado, lado, 16)
        canvas.clipPath(caminho, stroke=0, fill=0)
        canvas.setFillColor(colors.HexColor(NOITE))
        canvas.rect(0, 0, lado, lado, fill=1, stroke=0)
        canvas.radialGradient(
            lado * 0.06, lado * 0.96, lado * 0.75,
            [colors.HexColor("#5b1f4c"), colors.HexColor("#2a1a3d"), colors.HexColor(NOITE)],
            positions=[0, 0.35, 1], extend=False,
        )
        canvas.restoreState()

        canvas.setFillColor(colors.HexColor(NOITE_PROFUNDA))
        canvas.circle(c, c, R, fill=1, stroke=0)

        # Faixa zodiacal com o tom do elemento de cada signo
        for indice, (_, simbolo, elemento) in enumerate(SIGNOS):
            tom = ELEMENTOS[elemento]
            canvas.setFillColor(_misturar(tom, NOITE_PROFUNDA, 0.16 if indice % 2 == 0 else 0.09))
            canvas.wedge(c - R, c - R, c + R, c + R, 180 + indice * 30 - ascendente, 30, stroke=0, fill=1)
        canvas.setFillColor(colors.HexColor(NOITE_PROFUNDA))
        canvas.circle(c, c, raio["zodiaco_interno"], fill=1, stroke=0)
        for indice, (_, simbolo, elemento) in enumerate(SIGNOS):
            _texto_central(canvas, *ponto(indice * 30 + 15, raio["glifo_signo"]), simbolo, FONTE_SIGNOS, 17 * escala, ELEMENTOS[elemento])

        canvas.setStrokeColor(_misturar("#dbe2f8", NOITE_PROFUNDA, 0.32))
        canvas.setLineWidth(0.6)
        for indice in range(12):
            canvas.line(*ponto(indice * 30, raio["zodiaco_interno"]), *ponto(indice * 30, R))
        for indice in range(72):
            longo = indice % 2 == 0
            canvas.setStrokeColor(_misturar("#dbe2f8", NOITE_PROFUNDA, 0.42 if longo else 0.24))
            canvas.setLineWidth(0.45)
            canvas.line(
                *ponto(indice * 5, raio["zodiaco_interno"]),
                *ponto(indice * 5, raio["zodiaco_interno"] - (7 if longo else 4) * escala),
            )

        for r, intensidade, largura in (
            (R, 0.6, 1.1), (raio["zodiaco_interno"], 0.5, 0.7),
            (raio["casas_externo"], 0.32, 0.6), (raio["casas_interno"], 0.32, 0.6),
        ):
            canvas.setStrokeColor(_misturar(ROSA, NOITE_PROFUNDA, intensidade))
            canvas.setLineWidth(largura)
            canvas.circle(c, c, r, fill=0, stroke=1)

        # Casas: cúspide firme no anel das casas, tracejado discreto entre os planetas
        casas = self.dados.get("casas", [])
        cuspides = [float(casa.get("grau", 0)) for casa in casas[:12]]
        if len(cuspides) == 12:
            for grau in cuspides:
                canvas.setStrokeColor(_misturar(ROSA, NOITE_PROFUNDA, 0.45))
                canvas.setLineWidth(0.6)
                canvas.line(*ponto(grau, raio["casas_interno"]), *ponto(grau, raio["casas_externo"]))
                canvas.setStrokeColor(_misturar(ROSA, NOITE_PROFUNDA, 0.16))
                canvas.setDash(1.5, 3)
                canvas.line(*ponto(grau, raio["casas_externo"]), *ponto(grau, raio["zodiaco_interno"] - 8 * escala))
                canvas.setDash()
            for numero, grau in _meios_das_casas(casas):
                _texto_central(canvas, *ponto(grau, raio["casas_numero"]), str(numero), FONTE_NEGRITO, 9.5 * escala, _misturar("#e5bcc4", NOITE_PROFUNDA, 0.85))

        # Eixos ASC–DSC e MC–IC
        meio_do_ceu = self.dados.get("meio_do_ceu") or {}
        eixos = [("ASC", ascendente, True), ("DSC", ascendente + 180, False)]
        if "grau" in meio_do_ceu:
            mc = float(meio_do_ceu["grau"])
            eixos += [("MC", mc, True), ("IC", mc + 180, False)]
        for rotulo, grau, principal in eixos:
            canvas.setStrokeColor(_misturar(ROSA, NOITE_PROFUNDA, 0.85 if principal else 0.45))
            canvas.setLineWidth(1.4 if principal else 0.8)
            canvas.line(*ponto(grau, raio["casas_interno"]), *ponto(grau, R + 4))
            _texto_central(
                canvas, *ponto(grau, R + 15 * escala), rotulo, FONTE_NEGRITO, 9 * escala,
                ROSA if principal else "#ac878f",
            )

        # Aspectos no miolo, ligando as posições exatas
        for aspecto in self.dados.get("aspectos", []):
            primeiro = aspecto.get("planeta1") or {}
            segundo = aspecto.get("planeta2") or {}
            if "grau" not in primeiro or "grau" not in segundo:
                continue
            cor, _, _, _, tracejado = ASPECTOS.get(aspecto.get("tipo"), ("#ac878f", "", "", "", False))
            canvas.setStrokeColor(_misturar(cor, NOITE_PROFUNDA, 0.7))
            canvas.setLineWidth(0.8)
            if tracejado:
                canvas.setDash(3.5, 2.5)
            canvas.line(
                *ponto(float(primeiro["grau"]), raio["casas_interno"]),
                *ponto(float(segundo["grau"]), raio["casas_interno"]),
            )
            canvas.setDash()

        # Planetas
        planetas = self.dados.get("planetas", [])
        exibidos = _espalhar_posicoes([float(p.get("grau", 0)) for p in planetas])
        for planeta, exibido in zip(planetas, exibidos):
            nome = planeta.get("nome")
            cor = colors.HexColor(CORES_PLANETAS.get(nome, ROSA))
            grau = float(planeta.get("grau", 0))
            canvas.setStrokeColor(_misturar(_hex(cor), NOITE_PROFUNDA, 0.7))
            canvas.setLineWidth(0.7)
            caminho = canvas.beginPath()
            caminho.moveTo(*ponto(grau, raio["zodiaco_interno"]))
            caminho.lineTo(*ponto(grau, raio["planeta_traco"]))
            caminho.lineTo(*ponto(exibido, raio["planeta_glifo"] + 12.5 * escala))
            canvas.drawPath(caminho, stroke=1, fill=0)
            canvas.setFillColor(cor)
            canvas.circle(*ponto(grau, raio["zodiaco_interno"]), 1.8 * escala, fill=1, stroke=0)

            x, y = ponto(exibido, raio["planeta_glifo"])
            canvas.setFillColor(colors.HexColor(NOITE_PROFUNDA))
            canvas.setStrokeColor(_misturar(_hex(cor), NOITE_PROFUNDA, 0.45))
            canvas.setLineWidth(0.7)
            canvas.circle(x, y, 12.5 * escala, fill=1, stroke=1)
            _texto_central(canvas, x, y, SIMBOLOS_PLANETAS.get(nome, "✦"), FONTE_SIGNOS, 14.5 * escala, cor)

            graus, minutos = _grau_e_minutos(planeta)
            if planeta.get("retrogrado"):
                minutos += " ℞"
            x, y = ponto(exibido, raio["planeta_grau"])
            _texto_central(canvas, x, y + 4 * escala, graus, FONTE_NEGRITO, 9 * escala, "#dbe2f8")
            _texto_central(canvas, x, y - 5 * escala, minutos, FONTE_SIGNOS, 6.8 * escala, "#b8bfd4")

        # Terra no centro
        canvas.setStrokeColor(colors.HexColor(ROSA))
        canvas.setFillColor(colors.HexColor(NOITE_PROFUNDA))
        canvas.setLineWidth(1)
        canvas.circle(c, c, 6 * escala, fill=1, stroke=1)
        canvas.setLineWidth(0.7)
        canvas.line(c - 6 * escala, c, c + 6 * escala, c)
        canvas.line(c, c - 6 * escala, c, c + 6 * escala)


class LegendaAspectos(Flowable):
    """Linha de legenda com as cores e traços dos aspectos da mandala."""

    def __init__(self, largura: float):
        super().__init__()
        self.width = largura
        self.height = 9 * mm

    def draw(self):
        canvas = self.canv
        itens = list(ASPECTOS.items())
        passo = self.width / len(itens)
        for indice, (nome, (_, cor_papel, simbolo, _, tracejado)) in enumerate(itens):
            x = indice * passo + passo / 2 - 18 * mm / 2
            canvas.setStrokeColor(colors.HexColor(cor_papel))
            canvas.setLineWidth(1.6)
            if tracejado:
                canvas.setDash(3.5, 2.5)
            canvas.line(x, self.height / 2, x + 8 * mm, self.height / 2)
            canvas.setDash()
            canvas.setFillColor(colors.HexColor(TINTA))
            canvas.setFont(FONTE_SIGNOS, 9)
            canvas.drawString(x + 10 * mm, self.height / 2 - 3, f"{simbolo} {nome}")


class EquilibrioMapa(Flowable):
    """Barras com a distribuição dos planetas por elemento e modalidade."""

    def __init__(self, planetas: list[dict], largura: float):
        super().__init__()
        self.planetas = [p for p in planetas if p.get("nome") != "Nodo Norte" and p.get("signo") in ELEMENTO_SIGNO]
        self.width = largura
        self.height = 34 * mm

    def draw(self):
        canvas = self.canv
        total = max(1, len(self.planetas))
        grupos = [
            ("ELEMENTOS", [(NOMES_ELEMENTOS[e], sum(ELEMENTO_SIGNO[p["signo"]] == e for p in self.planetas), _no_papel(ELEMENTOS[e])) for e in ELEMENTOS]),
            ("MODALIDADES", [(m, sum(MODALIDADE_SIGNO[p["signo"]] == m for p in self.planetas), colors.HexColor(ACENTO)) for m in MODALIDADES]),
        ]
        coluna = (self.width - 10 * mm) / 2
        for indice_grupo, (titulo, linhas) in enumerate(grupos):
            x0 = indice_grupo * (coluna + 10 * mm)
            _texto_espacado(canvas, x0, self.height - 4 * mm, titulo, FONTE_NEGRITO, 7.5, TINTA_SUAVE, 1.4)
            for indice, (rotulo, quantidade, cor) in enumerate(linhas):
                y = self.height - 12 * mm - indice * 6.5 * mm
                canvas.setFillColor(colors.HexColor(TINTA))
                canvas.setFont(FONTE, 9)
                canvas.drawString(x0, y, rotulo)
                trilho_x, trilho_l = x0 + 24 * mm, coluna - 34 * mm
                canvas.setFillColor(colors.HexColor("#f1e7ec"))
                canvas.roundRect(trilho_x, y - 1, trilho_l, 4.2, 2.1, fill=1, stroke=0)
                if quantidade:
                    canvas.setFillColor(cor)
                    canvas.roundRect(trilho_x, y - 1, max(4.2, trilho_l * quantidade / total), 4.2, 2.1, fill=1, stroke=0)
                canvas.setFillColor(colors.HexColor(TINTA_SUAVE))
                canvas.setFont(FONTE_NEGRITO, 9)
                canvas.drawRightString(x0 + coluna, y, str(quantidade))


class CartaArcanoVetorial(Flowable):
    """Carta de impressão vetorial independente de imagens externas."""

    def __init__(self, arcano: dict, largura: float = 45 * mm):
        super().__init__()
        self.arcano = arcano
        self.width = largura
        self.height = largura * 1.64

    def draw(self):
        primaria, secundaria, fundo = self.arcano.get("cores", ["#d7c98d", "#58627f", "#101624"])
        canvas = self.canv
        canvas.setFillColor(colors.HexColor(fundo))
        canvas.setStrokeColor(colors.HexColor(primaria))
        canvas.setLineWidth(2)
        canvas.roundRect(1, 1, self.width - 2, self.height - 2, 8, fill=1, stroke=1)
        canvas.setStrokeColor(colors.HexColor(secundaria))
        canvas.roundRect(7, 7, self.width - 14, self.height - 14, 5, fill=0, stroke=1)
        canvas.setFillColor(colors.HexColor(primaria))
        canvas.setFont(FONTE_NEGRITO, 13)
        canvas.drawCentredString(self.width / 2, self.height - 22, str(self.arcano["numero"]))
        canvas.setLineWidth(.6)
        for raio in (18, 29, 40):
            canvas.circle(self.width / 2, self.height * .55, raio, fill=0, stroke=1)
        canvas.setFillColor(colors.HexColor(primaria))
        canvas.setFont(FONTE_SIGNOS, 38)
        canvas.drawCentredString(
            self.width / 2,
            self.height * .55 - 13,
            self.arcano.get("simbolo", "✦"),
        )
        canvas.setFont(FONTE_NEGRITO, 9)
        canvas.drawCentredString(self.width / 2, 22, self.arcano["nome"].upper())


def _estilos() -> dict[str, ParagraphStyle]:
    base = ParagraphStyle("OrbisCorpo", fontName=FONTE, fontSize=9.4, leading=14, textColor=colors.HexColor(TINTA))
    return {
        "corpo": base,
        "suave": ParagraphStyle("OrbisSuave", parent=base, textColor=colors.HexColor(TINTA_SUAVE), fontSize=8.6, leading=12.5),
        "eyebrow": ParagraphStyle("OrbisEyebrow", parent=base, fontName=FONTE_NEGRITO, fontSize=7.6, leading=10, textColor=colors.HexColor(ACENTO)),
        "titulo": ParagraphStyle("OrbisTitulo", parent=base, fontName=FONTE_NEGRITO, fontSize=17, leading=21, textColor=colors.HexColor(NOITE), spaceAfter=3 * mm),
        "card_titulo": ParagraphStyle("OrbisCardTitulo", parent=base, fontName=FONTE_NEGRITO, fontSize=14, leading=17, textColor=colors.HexColor(NOITE)),
    }


def _secao(eyebrow: str, titulo: str, estilos: dict) -> list:
    return [
        Paragraph(escape(eyebrow.upper()), estilos["eyebrow"]),
        Spacer(1, 1 * mm),
        Paragraph(escape(titulo), estilos["titulo"]),
    ]


def _simbolo(texto: str, cor: str | colors.Color, tamanho: float = 11) -> str:
    cor = cor if isinstance(cor, str) else _hex(cor)
    return f'<font name="{FONTE_SIGNOS}" size="{tamanho}" color="{cor}">{texto}</font>'


def _coordenada(valor, positivo: str, negativo: str) -> str:
    if valor is None:
        return "—"
    valor = float(valor)
    graus = int(abs(valor))
    minutos = round((abs(valor) - graus) * 60)
    return f"{graus}°{minutos:02d}′{positivo if valor >= 0 else negativo}"


def _cards_pilares(dados: dict, estilos: dict, largura: float) -> Table:
    planetas = {p.get("nome"): p for p in dados.get("planetas", [])}
    pilares = [
        ("SOL · ESSÊNCIA", "☉", CORES_PLANETAS["Sol"], planetas.get("Sol")),
        ("LUA · EMOÇÕES", "☽", CORES_PLANETAS["Lua"], planetas.get("Lua")),
        ("ASCENDENTE · PRESENÇA", "ASC", ROSA, dados.get("ascendente")),
    ]
    celulas = []
    for rotulo, simbolo, cor, ponto in pilares:
        ponto = ponto or {}
        signo = ponto.get("signo", "—")
        detalhe = ponto.get("posicao", "")
        if ponto.get("casa"):
            detalhe += f" · Casa {ponto['casa']}"
        glifo = _simbolo(simbolo, _no_papel(cor), 18) if simbolo != "ASC" else f'<font name="{FONTE_NEGRITO}" size="11" color="{_hex(_no_papel(cor))}">ASC</font>'
        celulas.append([
            Paragraph(glifo, estilos["corpo"]),
            Spacer(1, 2 * mm),
            Paragraph(escape(rotulo), estilos["eyebrow"]),
            Spacer(1, 1 * mm),
            Paragraph(f"{_simbolo(SIMBOLO_SIGNO.get(signo, ''), ACENTO, 13)} {escape(signo)}", estilos["card_titulo"]),
            Paragraph(escape(detalhe), estilos["suave"]),
        ])
    coluna = (largura - 8 * mm) / 3
    tabela = Table([[celulas[0], "", celulas[1], "", celulas[2]]], colWidths=[coluna, 4 * mm, coluna, 4 * mm, coluna])
    comandos = [("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 10), ("LEFTPADDING", (0, 0), (-1, -1), 10)]
    for coluna_card in (0, 2, 4):
        comandos += [
            ("BACKGROUND", (coluna_card, 0), (coluna_card, 0), colors.HexColor(FUNDO_SUAVE)),
            ("BOX", (coluna_card, 0), (coluna_card, 0), 0.6, colors.HexColor(LINHA)),
            ("LINEABOVE", (coluna_card, 0), (coluna_card, 0), 2.2, colors.HexColor(ROSA_INTENSO if coluna_card != 2 else LILAS)),
        ]
    tabela.setStyle(TableStyle(comandos))
    return tabela


def _ficha_tecnica(mapa: MapaNatal, dados: dict, estilos: dict, largura: float) -> Table:
    utc = str(dados.get("data_hora_utc") or "")
    pares = [
        ("Data", mapa.data_nascimento.strftime("%d/%m/%Y")),
        ("Hora local", mapa.horario_nascimento.strftime("%H:%M")),
        ("Local", mapa.local_nascimento),
        ("Hora UTC", utc[11:16] + " UTC" if len(utc) >= 16 else "—"),
        ("Coordenadas", f"{_coordenada(dados.get('latitude', mapa.latitude), 'N', 'S')}  {_coordenada(dados.get('longitude', mapa.longitude), 'L', 'O')}"),
        ("Fuso", dados.get("timezone_id") or mapa.timezone_id or "—"),
        ("Sistema de casas", dados.get("sistema_casas", "Placidus")),
        ("Meio do Céu", f"{(dados.get('meio_do_ceu') or {}).get('signo', '—')} {(dados.get('meio_do_ceu') or {}).get('posicao', '')}"),
    ]
    rotulo = ParagraphStyle("OrbisFichaRotulo", parent=estilos["eyebrow"], textColor=colors.HexColor(TINTA_SUAVE), fontSize=7)
    linhas = []
    for indice in range(0, len(pares), 2):
        linha = []
        for chave, valor in pares[indice:indice + 2]:
            linha += [Paragraph(escape(chave.upper()), rotulo), Paragraph(escape(str(valor)), estilos["corpo"])]
        linhas.append(linha)
    metade = largura / 2
    tabela = Table(linhas, colWidths=[30 * mm, metade - 30 * mm, 30 * mm, metade - 30 * mm])
    tabela.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, colors.HexColor(LINHA)),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return tabela


def _bloco_arcano(arcano: dict, estilos: dict, largura: float) -> Table:
    palavras = " · ".join(arcano["palavras_chave"]).upper()
    texto = [
        Paragraph("ARCANO PESSOAL", estilos["eyebrow"]),
        Spacer(1, 1.5 * mm),
        Paragraph(f"{arcano['numero']} · {escape(arcano['nome'])}", estilos["card_titulo"]),
        Spacer(1, 2 * mm),
        Paragraph(escape(palavras), ParagraphStyle("OrbisPalavras", parent=estilos["eyebrow"], textColor=colors.HexColor(TINTA_SUAVE))),
        Spacer(1, 3 * mm),
        Paragraph(escape(arcano["resumo"]), estilos["corpo"]),
    ]
    tabela = Table([[CartaArcanoVetorial(arcano, 38 * mm), texto]], colWidths=[46 * mm, largura - 46 * mm])
    tabela.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(FUNDO_SUAVE)),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor(LINHA)),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, colors.HexColor(arcano["cores"][0])),
        ("PADDING", (0, 0), (-1, -1), 9),
    ]))
    return tabela


def gerar_relatorio_pdf(mapa: MapaNatal) -> bytes:
    _registrar_fontes()
    memoria = BytesIO()
    margem = 17 * mm
    largura = A4[0] - 2 * margem
    altura_capa = 74 * mm
    nome_mapa = mapa.nome or "Mapa natal"
    documento = SimpleDocTemplate(
        memoria,
        pagesize=A4,
        rightMargin=margem,
        leftMargin=margem,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title=f"Mapa natal - {nome_mapa}",
        author="ORBIS",
        subject="Relatório do mapa natal",
        pageCompression=1,
    )
    estilos = _estilos()
    dados = mapa.dados or {}
    arcano = obter_arcano_pessoal(mapa.data_nascimento, mapa.arcano_pessoal_numero)
    nascimento = f"{mapa.data_nascimento.strftime('%d/%m/%Y')} · {mapa.horario_nascimento.strftime('%H:%M')} · {mapa.local_nascimento}"

    def capa(canvas, doc):
        """Faixa noturna da primeira página, no estilo da tela de login."""
        canvas.saveState()
        topo = A4[1]
        base = topo - altura_capa
        canvas.setFillColor(colors.HexColor(NOITE))
        canvas.rect(0, base, A4[0], altura_capa, fill=1, stroke=0)
        caminho = canvas.beginPath()
        caminho.rect(0, base, A4[0], altura_capa)
        canvas.clipPath(caminho, stroke=0, fill=0)
        canvas.radialGradient(
            0, topo + 10 * mm, 120 * mm,
            [colors.HexColor("#c2306f"), colors.HexColor("#4a1d55"), colors.HexColor(NOITE)],
            positions=[0, 0.4, 1], extend=False,
        )
        # anéis decorativos da esfera armilar à direita
        for raio, cor in ((58 * mm, "#3b2a4d"), (46 * mm, "#33405f"), (34 * mm, "#4a2b48")):
            canvas.setStrokeColor(colors.HexColor(cor))
            canvas.setLineWidth(0.8)
            canvas.circle(A4[0] - 28 * mm, base + altura_capa / 2, raio, fill=0, stroke=1)
        canvas.setStrokeColor(colors.HexColor("#6b3a5c"))
        canvas.ellipse(A4[0] - 86 * mm, base + 22 * mm, A4[0] + 30 * mm, base + 52 * mm, fill=0, stroke=1)
        canvas.restoreState()

        # faixa de destaque na borda, a mesma da tela de login
        canvas.saveState()
        faixa = canvas.beginPath()
        faixa.rect(0, base, 2.2 * mm, altura_capa)
        canvas.clipPath(faixa, stroke=0, fill=0)
        canvas.linearGradient(0, base, 0, topo, [colors.HexColor(LILAS), colors.HexColor(ROSA_INTENSO)], extend=False)
        canvas.restoreState()
        canvas.saveState()
        _marca(canvas, margem, topo - 17 * mm, 12, ROSA, 2.2)
        _texto_espacado(canvas, margem, topo - 31 * mm, "MAPA NATAL · OBSERVATÓRIO CELESTE", FONTE_NEGRITO, 7.8, "#ff8fb1", 2.4)
        canvas.setFillColor(colors.white)
        tamanho_nome = 30 if pdfmetrics.stringWidth(nome_mapa, FONTE_NEGRITO, 30) < largura * 0.68 else 22
        canvas.setFont(FONTE_NEGRITO, tamanho_nome)
        canvas.drawString(margem, topo - 46 * mm, nome_mapa)
        canvas.setFillColor(colors.HexColor("#e5bcc4"))
        canvas.setFont(FONTE, 10.5)
        canvas.drawString(margem, topo - 56 * mm, nascimento)
        canvas.restoreState()
        rodape(canvas, doc)

    def cabecalho_e_rodape(canvas, doc):
        canvas.saveState()
        _marca(canvas, margem, A4[1] - 12 * mm, 8.5, ACENTO, 1.8)
        canvas.setFillColor(colors.HexColor(TINTA_SUAVE))
        canvas.setFont(FONTE, 8)
        canvas.drawRightString(A4[0] - margem, A4[1] - 12 * mm, nome_mapa)
        canvas.setStrokeColor(colors.HexColor(LINHA))
        canvas.setLineWidth(0.6)
        canvas.line(margem, A4[1] - 14.5 * mm, A4[0] - margem, A4[1] - 14.5 * mm)
        canvas.restoreState()
        rodape(canvas, doc)

    def rodape(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor(LINHA))
        canvas.setLineWidth(0.6)
        canvas.line(margem, 12 * mm, A4[0] - margem, 12 * mm)
        canvas.setFillColor(colors.HexColor(TINTA_SUAVE))
        canvas.setFont(FONTE, 7.5)
        canvas.drawString(margem, 8 * mm, "ORBIS · conteúdo simbólico para reflexão e autoconhecimento")
        canvas.drawRightString(A4[0] - margem, 8 * mm, f"{doc.page}")
        canvas.restoreState()

    planetas = dados.get("planetas", [])
    historia = [
        Spacer(1, altura_capa - 22 * mm + 8 * mm),
        *_secao("Seus pilares", "Sol, Lua e Ascendente", estilos),
        _cards_pilares(dados, estilos, largura),
        Spacer(1, 8 * mm),
        *_secao("Ficha técnica", "Dados do nascimento", estilos),
        _ficha_tecnica(mapa, dados, estilos, largura),
        Spacer(1, 8 * mm),
        KeepTogether([*_secao("Tarot", "Seu arcano pessoal", estilos), _bloco_arcano(arcano, estilos, largura)]),
        PageBreak(),
        *_secao("Mandala natal", "O céu no instante do nascimento", estilos),
        Paragraph(
            "O Ascendente fica à esquerda e o zodíaco corre no sentido anti-horário. "
            f"Cada planeta mostra seu glifo e o grau dentro do signo ({_simbolo('℞', TINTA_SUAVE, 9)} indica movimento retrógrado); "
            "os números internos são as casas e as linhas do centro, os aspectos.",
            estilos["suave"],
        ),
        Spacer(1, 4 * mm),
        MandalaVetorial(dados, largura),
        Spacer(1, 3 * mm),
        LegendaAspectos(largura),
        PageBreak(),
        *_secao("Posições", "Planetas no mapa", estilos),
        _tabela(
            [["", "Planeta", "Signo", "Casa", "Posição", "Movimento"]] + [
                [
                    _simbolo(SIMBOLOS_PLANETAS.get(p.get("nome"), "✦"), _no_papel(CORES_PLANETAS.get(p.get("nome"), ROSA)), 12),
                    escape(str(p.get("nome"))),
                    f"{_simbolo(SIMBOLO_SIGNO.get(p.get('signo'), ''), ACENTO)} {escape(str(p.get('signo')))}",
                    p.get("casa"),
                    p.get("posicao"),
                    f"{_simbolo('℞', ACENTO, 10)} Retrógrado" if p.get("retrogrado") else "Direto",
                ]
                for p in planetas
            ],
            larguras=[10 * mm, 34 * mm, 40 * mm, 18 * mm, 30 * mm, largura - 132 * mm],
        ),
        Spacer(1, 8 * mm),
    ]
    casas = dados.get("casas", [])
    if casas:
        linhas_casas = [
            [c.get("numero"), f"{_simbolo(SIMBOLO_SIGNO.get(c.get('signo'), ''), ACENTO)} {escape(str(c.get('signo')))}", c.get("posicao")]
            for c in casas
        ]
        metade = (largura - 6 * mm) / 2
        larguras_casas = [16 * mm, metade - 40 * mm, 24 * mm]
        historia += [
            KeepTogether([
                *_secao("Casas", "Cúspides das doze casas", estilos),
                Table(
                    [[
                        _tabela([["Casa", "Signo", "Cúspide"]] + linhas_casas[:6], larguras=larguras_casas),
                        "",
                        _tabela([["Casa", "Signo", "Cúspide"]] + linhas_casas[6:], larguras=larguras_casas),
                    ]],
                    colWidths=[metade, 6 * mm, metade],
                    style=TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP")]),
                ),
            ]),
            Spacer(1, 8 * mm),
        ]
    historia += [
        KeepTogether([*_secao("Equilíbrio", "Elementos e modalidades", estilos), EquilibrioMapa(planetas, largura)]),
        CondPageBreak(60 * mm),
        Spacer(1, 6 * mm),
        *_secao("Aspectos", "Diálogos entre os planetas", estilos),
    ]
    aspectos = dados.get("aspectos", [])
    if aspectos:
        historia.append(_tabela(
            [["Planeta", "Aspecto", "Planeta", "Orbe", "Natureza"]] + [
                [
                    f"{_simbolo(SIMBOLOS_PLANETAS.get((a.get('planeta1') or {}).get('nome'), ''), _no_papel(CORES_PLANETAS.get((a.get('planeta1') or {}).get('nome'), ROSA)))} {escape(str((a.get('planeta1') or {}).get('nome')))}",
                    f"{_simbolo(ASPECTOS.get(a.get('tipo'), ('', TINTA, '·'))[2], ASPECTOS.get(a.get('tipo'), ('', TINTA))[1], 12)} {escape(str(a.get('tipo')))}",
                    f"{_simbolo(SIMBOLOS_PLANETAS.get((a.get('planeta2') or {}).get('nome'), ''), _no_papel(CORES_PLANETAS.get((a.get('planeta2') or {}).get('nome'), ROSA)))} {escape(str((a.get('planeta2') or {}).get('nome')))}",
                    f"{float(a.get('orbe', 0)):.2f}°",
                    ASPECTOS.get(a.get("tipo"), ("", "", "", "—"))[3],
                ]
                for a in aspectos
            ],
            larguras=[40 * mm, 40 * mm, 40 * mm, 20 * mm, largura - 140 * mm],
        ))
    else:
        historia.append(Paragraph("Nenhum aspecto foi registrado para este mapa.", estilos["corpo"]))
    historia += [
        Spacer(1, 8 * mm),
        Paragraph(
            "Documento gerado pelo ORBIS a partir das efemérides suíças (Swiss Ephemeris). "
            "As leituras astrológicas são conteúdo simbólico para reflexão e entretenimento e não "
            "substituem orientação médica, jurídica, financeira ou psicológica.",
            estilos["suave"],
        ),
    ]
    documento.build(historia, onFirstPage=capa, onLaterPages=cabecalho_e_rodape)
    conteudo = memoria.getvalue()
    if len(conteudo) > TAMANHO_MAXIMO_PDF:
        raise RelatorioMuitoGrandeError("O relatório excedeu o limite de 15 MB.")
    return conteudo


def _tabela(linhas, *, larguras=None):
    """Tabela com cabeçalho noturno; as células aceitam marcação de Paragraph."""
    estilo_celula = ParagraphStyle(
        "OrbisCelula", fontName=FONTE, fontSize=8.8, leading=12,
        textColor=colors.HexColor(TINTA),
    )
    estilo_cabecalho = ParagraphStyle(
        "OrbisCabecalho", parent=estilo_celula, fontName=FONTE_NEGRITO, fontSize=7.4,
        textColor=colors.HexColor("#f4d3dd"),
    )
    seguras = [
        [
            Paragraph(
                escape(str(valor).upper()) if indice_linha == 0
                else str(valor if valor is not None else "—"),
                estilo_cabecalho if indice_linha == 0 else estilo_celula,
            )
            for valor in linha
        ]
        for indice_linha, linha in enumerate(linhas)
    ]
    tabela = Table(seguras, colWidths=larguras, repeatRows=1, hAlign="LEFT")
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(NOITE)),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(FUNDO_SUAVE)]),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, colors.HexColor(LINHA)),
        ("LINEBELOW", (0, 0), (-1, 0), 1.6, colors.HexColor(ROSA_INTENSO)),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
    ]))
    return tabela
