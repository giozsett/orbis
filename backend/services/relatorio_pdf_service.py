"""Relatório vetorial e compacto do mapa natal principal."""

from io import BytesIO
from math import cos, pi, sin
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
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
SIGNOS = [
    ("Áries", "♈"), ("Touro", "♉"), ("Gêmeos", "♊"),
    ("Câncer", "♋"), ("Leão", "♌"), ("Virgem", "♍"),
    ("Libra", "♎"), ("Escorpião", "♏"), ("Sagitário", "♐"),
    ("Capricórnio", "♑"), ("Aquário", "♒"), ("Peixes", "♓"),
]
CORES_PLANETAS = {
    "Sol": "#ffd16a", "Lua": "#d9c5ff", "Mercúrio": "#9cd7ee",
    "Vênus": "#ff9ec1", "Marte": "#ff897d", "Júpiter": "#c997ff",
    "Saturno": "#d3b99d", "Urano": "#87dfd8", "Netuno": "#76b9ff",
    "Plutão": "#e3a8c6", "Nodo Norte": "#f1d6aa",
}


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


def _meios_das_casas(casas: list[dict]) -> list[tuple[int, float]]:
    cuspides = [float(casa.get("grau", indice * 30)) % 360 for indice, casa in enumerate(casas[:12])]
    if len(cuspides) != 12:
        cuspides = [indice * 30.0 for indice in range(12)]
    return [
        (indice + 1, (grau + ((cuspides[(indice + 1) % 12] - grau) % 360) / 2) % 360)
        for indice, grau in enumerate(cuspides)
    ]


class MandalaVetorial(Flowable):
    def __init__(self, dados: dict, tamanho: float = 158 * mm):
        super().__init__()
        self.dados = dados
        self.width = tamanho
        self.height = tamanho

    def draw(self):
        _registrar_fontes()
        centro = self.width / 2
        raio = self.width * 0.46
        self.canv.setStrokeColor(colors.HexColor("#ffb1c3"))
        self.canv.setFillColor(colors.HexColor("#0b1323"))
        self.canv.circle(centro, centro, raio, fill=1, stroke=1)

        # Faixa zodiacal alternada para separar visualmente cada signo.
        for indice in range(12):
            if indice % 2 == 0:
                self.canv.setFillColor(colors.HexColor("#131e33"))
                self.canv.setStrokeColor(colors.HexColor("#131e33"))
                self.canv.wedge(
                    centro - raio, centro - raio, centro + raio, centro + raio,
                    indice * 30 - 90, 30, fill=1, stroke=0,
                )
        self.canv.setFillColor(colors.HexColor("#0b1323"))
        self.canv.circle(centro, centro, raio * 0.79, fill=1, stroke=0)

        self.canv.setStrokeColor(colors.HexColor("#ac878f"))
        self.canv.setLineWidth(0.55)
        for indice, (_, simbolo) in enumerate(SIGNOS):
            angulo = (indice * 30 - 90) * pi / 180
            self.canv.line(
                centro + raio * 0.79 * cos(angulo),
                centro + raio * 0.79 * sin(angulo),
                centro + raio * cos(angulo),
                centro + raio * sin(angulo),
            )
            meio = (indice * 30 + 15 - 90) * pi / 180
            self.canv.setFillColor(colors.HexColor("#f7c5d5"))
            self.canv.setFont(FONTE_SIGNOS, 11)
            self.canv.drawCentredString(
                centro + raio * 0.895 * cos(meio),
                centro + raio * 0.895 * sin(meio) - 4,
                simbolo,
            )

        casas = self.dados.get("casas", [])
        cuspides = [float(casa.get("grau", indice * 30)) for indice, casa in enumerate(casas[:12])]
        if len(cuspides) != 12:
            cuspides = [indice * 30.0 for indice in range(12)]
        self.canv.setStrokeColor(colors.HexColor("#896573"))
        for grau in cuspides:
            angulo = (grau - 90) * pi / 180
            self.canv.line(
                centro + raio * 0.34 * cos(angulo), centro + raio * 0.34 * sin(angulo),
                centro + raio * 0.79 * cos(angulo), centro + raio * 0.79 * sin(angulo),
            )
        self.canv.setStrokeColor(colors.HexColor("#633e4f"))
        self.canv.circle(centro, centro, raio * 0.79, fill=0, stroke=1)
        self.canv.circle(centro, centro, raio * 0.68, fill=0, stroke=1)
        self.canv.circle(centro, centro, raio * 0.34, fill=0, stroke=1)

        for numero, grau in _meios_das_casas(casas):
            angulo = (grau - 90) * pi / 180
            x = centro + raio * 0.405 * cos(angulo)
            y = centro + raio * 0.405 * sin(angulo)
            self.canv.setFillColor(colors.HexColor("#633e4f"))
            self.canv.circle(x, y, 7, fill=1, stroke=0)
            self.canv.setFillColor(colors.white)
            self.canv.setFont(FONTE_NEGRITO, 6.5)
            self.canv.drawCentredString(x, y - 2.3, str(numero))

        pontos = {}
        planetas = sorted(self.dados.get("planetas", []), key=lambda item: float(item.get("grau", 0)))
        grau_anterior = None
        nivel = 0
        for planeta in planetas:
            grau = float(planeta.get("grau", 0))
            if grau_anterior is not None and abs(grau - grau_anterior) < 8:
                nivel = (nivel + 1) % 3
            else:
                nivel = 0
            grau_anterior = grau
            angulo = (grau - 90) * pi / 180
            raio_planeta = (0.56 + nivel * 0.055) * raio
            pontos[planeta.get("nome")] = (
                centro + raio_planeta * cos(angulo),
                centro + raio_planeta * sin(angulo),
            )
        cores = {
            "conjunção": "#ffb1c3", "sextil": "#b86dfd",
            "quadratura": "#ff4b89", "trígono": "#eab9ce", "oposição": "#93000a",
        }
        for aspecto in self.dados.get("aspectos", []):
            primeiro = pontos.get((aspecto.get("planeta1") or {}).get("nome"))
            segundo = pontos.get((aspecto.get("planeta2") or {}).get("nome"))
            if primeiro and segundo:
                self.canv.setStrokeColor(colors.HexColor(cores.get(aspecto.get("tipo"), "#5c3f45")))
                self.canv.setLineWidth(0.5)
                self.canv.line(*primeiro, *segundo)
        for nome, (x, y) in pontos.items():
            self.canv.setFillColor(colors.HexColor(CORES_PLANETAS.get(nome, "#ffb1c3")))
            self.canv.circle(x, y, 3.6, fill=1, stroke=0)
            self.canv.setFillColor(colors.white)
            self.canv.setFont(FONTE, 6.2)
            self.canv.drawCentredString(x, y + 6.5, str(nome))


class CartaArcanoVetorial(Flowable):
    """Fallback de impressão independente de imagens externas."""

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
        canvas.setFont(FONTE_NEGRITO, 9)
        canvas.drawCentredString(self.width / 2, 22, self.arcano["nome"].upper())


def gerar_relatorio_pdf(mapa: MapaNatal) -> bytes:
    _registrar_fontes()
    memoria = BytesIO()
    documento = SimpleDocTemplate(
        memoria,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title=f"Efemérides - {mapa.nome or 'Mapa natal'}",
        author="ORBIS",
        pageCompression=1,
    )
    estilos = getSampleStyleSheet()
    titulo = ParagraphStyle(
        "OrbisTitulo", parent=estilos["Title"], textColor=colors.HexColor("#66002c"),
        fontName=FONTE_NEGRITO, fontSize=25, leading=29, alignment=TA_CENTER,
    )
    subtitulo = ParagraphStyle(
        "OrbisSubtitulo", parent=estilos["Heading2"], textColor=colors.HexColor("#633e4f"),
        fontName=FONTE_NEGRITO, fontSize=15, leading=18, spaceAfter=7,
    )
    corpo = ParagraphStyle(
        "OrbisCorpo", parent=estilos["BodyText"], textColor=colors.HexColor("#2d3546"),
        fontName=FONTE, fontSize=9.2, leading=13,
    )
    dados = mapa.dados or {}
    arcano = obter_arcano_pessoal(mapa.data_nascimento, mapa.arcano_pessoal_numero)
    historia = [
        Paragraph("ORBIS", titulo),
        Paragraph("Relatório de Efemérides do Mapa Natal", subtitulo),
        Spacer(1, 4 * mm),
        _tabela([
            ["Mapa", mapa.nome or "Mapa natal"],
            ["Nascimento", f"{mapa.data_nascimento.strftime('%d/%m/%Y')} às {mapa.horario_nascimento.strftime('%H:%M')}"],
            ["Local", mapa.local_nascimento],
            ["Casas", dados.get("sistema_casas", "Placidus")],
        ], larguras=[38 * mm, 125 * mm]),
        Spacer(1, 5 * mm),
        Paragraph("Seu Arcano Pessoal", subtitulo),
        Table([[
            CartaArcanoVetorial(arcano),
            [
                Paragraph(f"<b>{arcano['numero']} · {escape(arcano['nome'])}</b>", corpo),
                Spacer(1, 2 * mm),
                Paragraph(escape(" · ".join(arcano["palavras_chave"])), corpo),
                Spacer(1, 2 * mm),
                Paragraph(escape(arcano["resumo"]), corpo),
                Spacer(1, 2 * mm),
                Paragraph("Leitura simbólica do tarot, complementar ao mapa natal.", corpo),
            ],
        ]], colWidths=[52 * mm, 108 * mm], style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), .5, colors.HexColor(arcano["cores"][0])),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff6f8")),
            ("PADDING", (0, 0), (-1, -1), 7),
        ])),
        Spacer(1, 6 * mm),
        MandalaVetorial(dados),
        PageBreak(),
        Paragraph("Posições planetárias", subtitulo),
        _tabela(
            [["Planeta", "Signo", "Casa", "Posição", "Movimento"]] + [
                [p.get("nome"), p.get("signo"), p.get("casa"), p.get("posicao"), "Retrógrado" if p.get("retrogrado") else "Direto"]
                for p in dados.get("planetas", [])
            ],
            cabecalho=True,
            larguras=[35 * mm, 34 * mm, 19 * mm, 38 * mm, 37 * mm],
        ),
        Spacer(1, 7 * mm),
        Paragraph("Casas", subtitulo),
        _tabela(
            [["Casa", "Signo", "Cúspide"]] + [
                [c.get("numero"), c.get("signo"), c.get("posicao")]
                for c in dados.get("casas", [])
            ],
            cabecalho=True,
            larguras=[30 * mm, 68 * mm, 65 * mm],
        ),
        PageBreak(),
        Paragraph("Aspectos natais", subtitulo),
    ]
    aspectos = dados.get("aspectos", [])
    if aspectos:
        historia.append(_tabela(
            [["Planeta", "Aspecto", "Planeta", "Orbe"]] + [
                [
                    (a.get("planeta1") or {}).get("nome"), a.get("tipo"),
                    (a.get("planeta2") or {}).get("nome"), f"{float(a.get('orbe', 0)):.2f}°",
                ]
                for a in aspectos
            ],
            cabecalho=True,
            larguras=[42 * mm, 42 * mm, 42 * mm, 30 * mm],
        ))
    else:
        historia.append(Paragraph("Nenhum aspecto foi registrado para este mapa.", corpo))
    historia.extend([
        Spacer(1, 10 * mm),
        Paragraph(
            "Documento técnico gerado pelo ORBIS. As interpretações astrológicas são conteúdo simbólico para reflexão e entretenimento.",
            corpo,
        ),
    ])
    documento.build(historia, onFirstPage=_rodape, onLaterPages=_rodape)
    conteudo = memoria.getvalue()
    if len(conteudo) > TAMANHO_MAXIMO_PDF:
        raise RelatorioMuitoGrandeError("O relatório excedeu o limite de 15 MB.")
    return conteudo


def _tabela(linhas, *, cabecalho=False, larguras=None):
    estilo_celula = ParagraphStyle(
        "OrbisCelula", fontName=FONTE, fontSize=8.3, leading=11,
        textColor=colors.HexColor("#2d3546"),
    )
    estilo_cabecalho = ParagraphStyle(
        "OrbisCabecalho", parent=estilo_celula, fontName=FONTE_NEGRITO,
        textColor=colors.white,
    )
    estilo_rotulo = ParagraphStyle(
        "OrbisRotulo", parent=estilo_celula, fontName=FONTE_NEGRITO,
        textColor=colors.HexColor("#633e4f"),
    )
    seguras = [
        [
            Paragraph(
                escape(str(valor if valor is not None else "—")),
                estilo_cabecalho if cabecalho and indice_linha == 0
                else estilo_rotulo if not cabecalho and indice_coluna == 0
                else estilo_celula,
            )
            for indice_coluna, valor in enumerate(linha)
        ]
        for indice_linha, linha in enumerate(linhas)
    ]
    tabela = Table(seguras, colWidths=larguras, repeatRows=1 if cabecalho else 0, hAlign="LEFT")
    comandos = [
        ("FONTNAME", (0, 0), (-1, -1), FONTE),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#2d3546")),
        ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#e5bcc4")),
        ("LINEBELOW", (0, 0), (-1, -2), 0.28, colors.HexColor("#efd7dd")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fff6f8")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if cabecalho:
        comandos.extend([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#633e4f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), FONTE_NEGRITO),
        ])
    else:
        comandos.extend([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#fff0f4")),
            ("FONTNAME", (0, 0), (0, -1), FONTE_NEGRITO),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#633e4f")),
        ])
    tabela.setStyle(TableStyle(comandos))
    return tabela


def _rodape(canvas, documento):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e5bcc4"))
    canvas.line(16 * mm, 11 * mm, A4[0] - 16 * mm, 11 * mm)
    canvas.setFillColor(colors.HexColor("#633e4f"))
    canvas.setFont(FONTE, 7.5)
    canvas.drawString(16 * mm, 7 * mm, "ORBIS · Efemérides natais")
    canvas.drawRightString(A4[0] - 16 * mm, 7 * mm, f"Página {documento.page}")
    canvas.restoreState()
