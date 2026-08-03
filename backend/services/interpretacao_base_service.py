"""Interpretações astrológicas curtas, determinísticas e sem uso de IA."""

from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path


CAMINHO_CATALOGO = Path(__file__).resolve().parents[1] / "data" / "interpretacoes_base.json"
PLANETAS_FEMININOS = {"Lua", "Vênus"}

TEXTO_PLANETA_PADRAO = "Este ponto representa uma função importante da personalidade."
TEXTO_SIGNO_PADRAO = "Essa posição mostra como essa energia tende a ser expressa."
TEXTO_CASA_PADRAO = "em uma área importante da experiência pessoal."


@lru_cache(maxsize=1)
def carregar_catalogo() -> dict:
    with CAMINHO_CATALOGO.open(encoding="utf-8") as arquivo:
        return json.load(arquivo)


def gerar_interpretacao_base(planeta: str, signo: str, casa: int) -> dict:
    catalogo = carregar_catalogo()
    texto_planeta = catalogo["planetas"].get(planeta, TEXTO_PLANETA_PADRAO)
    texto_signo = catalogo["signos"].get(signo, TEXTO_SIGNO_PADRAO)
    texto_casa = catalogo["casas"].get(str(casa), TEXTO_CASA_PADRAO)
    possessivo = "Sua" if planeta in PLANETAS_FEMININOS else "Seu"

    return {
        "planeta": texto_planeta,
        "signo": f"{possessivo} {planeta} está em {signo}. {texto_signo}",
        "casa": f"Na Casa {casa}, essa energia se manifesta {texto_casa}",
    }


def enriquecer_dados_mapa(dados: dict | None) -> dict | None:
    """Adiciona textos a mapas antigos sem alterar o JSON persistido em memória."""
    if dados is None:
        return None

    dados_enriquecidos = deepcopy(dados)
    for planeta in dados_enriquecidos.get("planetas", []):
        if not planeta.get("interpretacao_base"):
            planeta["interpretacao_base"] = gerar_interpretacao_base(
                planeta.get("nome", "Ponto"),
                planeta.get("signo", "signo não informado"),
                planeta.get("casa", 0),
            )
    return dados_enriquecidos
