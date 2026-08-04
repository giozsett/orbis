"""Relatório vetorial e compacto do mapa natal principal."""

from io import BytesIO
from math import cos, pi, sin
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
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


TAMANHO_MAXIMO_PDF = 15 * 1024 * 1024


class RelatorioPdfError(RuntimeError):
    pass


class RelatorioMuitoGrandeError(RelatorioPdfError):
    pass


class MandalaVetorial(Flowable):
    def __init__(self, dados: dict, tamanho: float = 150 * mm):
        super().__init__()
        self.dados = dados
        self.width = tamanho
        self.height = tamanho

    def draw(self):
        centro = self.width / 2
        raio = self.width * 0.43
        self.canv.setStrokeColor(colors.HexColor("#ffb1c3"))
        self.canv.setFillColor(colors.HexColor("#0b1323"))
        self.canv.circle(centro, centro, raio, fill=1, stroke=1)
        self.canv.setStrokeColor(colors.HexColor("#ac878f"))
        for indice in range(12):
            angulo = (indice * 30 - 90) * pi / 180
            self.canv.line(
                centro + raio * 0.46 * cos(angulo),
                centro + raio * 0.46 * sin(angulo),
                centro + raio * cos(angulo),
                centro + raio * sin(angulo),
            )
        self.canv.setStrokeColor(colors.HexColor("#633e4f"))
        self.canv.circle(centro, centro, raio * 0.72, fill=0, stroke=1)
        self.canv.circle(centro, centro, raio * 0.46, fill=0, stroke=1)

        pontos = {}
        for planeta in self.dados.get("planetas", []):
            grau = float(planeta.get("grau", 0))
            angulo = (grau - 90) * pi / 180
            pontos[planeta.get("nome")] = (
                centro + raio * 0.68 * cos(angulo),
                centro + raio * 0.68 * sin(angulo),
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
            self.canv.setFillColor(colors.HexColor("#ffb1c3"))
            self.canv.circle(x, y, 3.2, fill=1, stroke=0)
            self.canv.setFillColor(colors.white)
            self.canv.setFont("Helvetica", 6.5)
            self.canv.drawCentredString(x, y + 6, str(nome))


def gerar_relatorio_pdf(mapa: MapaNatal) -> bytes:
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
        fontName="Helvetica-Bold", fontSize=25, leading=29, alignment=TA_CENTER,
    )
    subtitulo = ParagraphStyle(
        "OrbisSubtitulo", parent=estilos["Heading2"], textColor=colors.HexColor("#633e4f"),
        fontName="Helvetica-Bold", fontSize=15, leading=18, spaceAfter=7,
    )
    corpo = ParagraphStyle(
        "OrbisCorpo", parent=estilos["BodyText"], textColor=colors.HexColor("#2d3546"),
        fontName="Helvetica", fontSize=9.2, leading=13,
    )
    dados = mapa.dados or {}
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
        MandalaVetorial(dados),
        PageBreak(),
        Paragraph("Posições planetárias", subtitulo),
        _tabela(
            [["Planeta", "Signo", "Casa", "Posição", "Movimento"]] + [
                [p.get("nome"), p.get("signo"), p.get("casa"), p.get("posicao"), "Retrógrado" if p.get("retrogrado") else "Direto"]
                for p in dados.get("planetas", [])
            ],
            cabecalho=True,
        ),
        Spacer(1, 7 * mm),
        Paragraph("Casas", subtitulo),
        _tabela(
            [["Casa", "Signo", "Cúspide"]] + [
                [c.get("numero"), c.get("signo"), c.get("posicao")]
                for c in dados.get("casas", [])
            ],
            cabecalho=True,
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
    seguras = [[escape(str(valor if valor is not None else "—")) for valor in linha] for linha in linhas]
    tabela = Table(seguras, colWidths=larguras, repeatRows=1 if cabecalho else 0, hAlign="LEFT")
    comandos = [
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#2d3546")),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#e5bcc4")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fff6f8")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if cabecalho:
        comandos.extend([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#633e4f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ])
    tabela.setStyle(TableStyle(comandos))
    return tabela


def _rodape(canvas, documento):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e5bcc4"))
    canvas.line(16 * mm, 11 * mm, A4[0] - 16 * mm, 11 * mm)
    canvas.setFillColor(colors.HexColor("#633e4f"))
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(16 * mm, 7 * mm, "ORBIS · Efemérides natais")
    canvas.drawRightString(A4[0] - 16 * mm, 7 * mm, f"Página {documento.page}")
    canvas.restoreState()
