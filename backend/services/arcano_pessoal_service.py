"""Cálculo determinístico e catálogo dos Arcanos Maiores."""

from copy import deepcopy
from datetime import date
from functools import lru_cache
import json
from pathlib import Path

CATALOGO_PATH = Path(__file__).resolve().parents[1] / "data" / "arcanos_maiores.json"


class ArcanoPessoalError(ValueError):
    """Indica uma entrada inadequada para o cálculo."""


def somar_digitos(numero: int) -> int:
    return sum(int(digito) for digito in str(abs(numero)))


def reduzir_arcano(numero: int) -> int:
    """Soma os dígitos enquanto o número passar de 22; zero equivale ao Louco (22)."""
    while numero > 22:
        numero = somar_digitos(numero)
    return numero or 22


def _validar_data(data_nascimento) -> None:
    if not isinstance(data_nascimento, date):
        raise ArcanoPessoalError("Informe uma data de nascimento válida.")


def calcular_arcano_pessoal(data_nascimento: date) -> int:
    """Soma dia, mês e ano e reduz o total até o intervalo de 1 a 22."""
    _validar_data(data_nascimento)
    resultado = reduzir_arcano(data_nascimento.day + data_nascimento.month + data_nascimento.year)
    if not 1 <= resultado <= 22:
        raise ArcanoPessoalError("Não foi possível obter um arcano entre 1 e 22.")
    return resultado


def calcular_arcano_complementar(pessoal: int) -> int | None:
    """Soma os dígitos do arcano pessoal de dois dígitos (15 → 6); com um dígito não há complementar."""
    if pessoal < 10:
        return None
    return reduzir_arcano(somar_digitos(pessoal))


def calcular_arcano_anual(data_nascimento: date, ano: int) -> int:
    """Soma dia e mês de nascimento ao ano informado e reduz até 22."""
    _validar_data(data_nascimento)
    return reduzir_arcano(data_nascimento.day + data_nascimento.month + ano)


@lru_cache(maxsize=1)
def carregar_catalogo_arcanos() -> dict[int, dict]:
    with CATALOGO_PATH.open(encoding="utf-8") as arquivo:
        itens = json.load(arquivo)
    catalogo = {int(item["numero"]): item for item in itens}
    if set(catalogo) != set(range(1, 23)):
        raise RuntimeError("O catálogo deve conter exatamente os 22 Arcanos Maiores.")
    return catalogo


def obter_arcano(numero: int) -> dict:
    """Retorna uma cópia segura dos dados públicos de um arcano do catálogo."""
    item = deepcopy(carregar_catalogo_arcanos()[numero])
    item["imagem_carta"] = f"/images/arcanos/{item['numero']:02d}-{item['slug']}.webp"
    item["imagem_carta_pdf"] = f"/images/arcanos/{item['numero']:02d}-{item['slug']}-pdf.png"
    return item


def obter_arcano_pessoal(data_nascimento: date, numero: int | None = None) -> dict:
    """Retorna o arcano pessoal, ignorando um número salvo que não corresponda à data."""
    return obter_arcano(calcular_arcano_pessoal(data_nascimento))


def obter_arcanos(data_nascimento: date, ano: int) -> dict:
    """Arcano pessoal, complementar (quando houver) e anual do ano informado."""
    pessoal = calcular_arcano_pessoal(data_nascimento)
    complementar = calcular_arcano_complementar(pessoal)
    anual = obter_arcano(calcular_arcano_anual(data_nascimento, ano))
    anual["ano"] = ano
    return {
        "pessoal": obter_arcano(pessoal),
        "complementar": obter_arcano(complementar) if complementar else None,
        "anual": anual,
    }
