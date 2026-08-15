"""Cálculo determinístico e catálogo dos Arcanos Maiores."""

from copy import deepcopy
from datetime import date
from functools import lru_cache
import json
from pathlib import Path

CATALOGO_PATH = Path(__file__).resolve().parents[1] / "data" / "arcanos_maiores.json"


class ArcanoPessoalError(ValueError):
    """Indica uma entrada inadequada para o cálculo."""


def calcular_arcano_pessoal(data_nascimento: date) -> int:
    """Soma dia, mês e ano e reduz o total até o intervalo de 1 a 22."""
    if not isinstance(data_nascimento, date):
        raise ArcanoPessoalError("Informe uma data de nascimento válida.")
    resultado = data_nascimento.day + data_nascimento.month + data_nascimento.year
    while resultado > 22:
        resultado = sum(int(digito) for digito in str(resultado))
    if not 1 <= resultado <= 22:
        raise ArcanoPessoalError("Não foi possível obter um arcano entre 1 e 22.")
    return resultado


@lru_cache(maxsize=1)
def carregar_catalogo_arcanos() -> dict[int, dict]:
    with CATALOGO_PATH.open(encoding="utf-8") as arquivo:
        itens = json.load(arquivo)
    catalogo = {int(item["numero"]): item for item in itens}
    if set(catalogo) != set(range(1, 23)):
        raise RuntimeError("O catálogo deve conter exatamente os 22 Arcanos Maiores.")
    return catalogo


def obter_arcano_pessoal(data_nascimento: date, numero: int | None = None) -> dict:
    """Retorna uma cópia segura dos dados públicos do arcano pessoal."""
    calculado = calcular_arcano_pessoal(data_nascimento)
    numero = numero if numero == calculado else calculado
    item = deepcopy(carregar_catalogo_arcanos()[numero])
    item["imagem_carta"] = f"/images/arcanos/{item['numero']:02d}-{item['slug']}.webp"
    item["imagem_carta_pdf"] = f"/images/arcanos/{item['numero']:02d}-{item['slug']}-pdf.png"
    return item
