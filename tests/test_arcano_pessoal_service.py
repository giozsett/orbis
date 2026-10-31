from datetime import date

import pytest

from backend.services.arcano_pessoal_service import (
    ArcanoPessoalError,
    calcular_arcano_anual,
    calcular_arcano_complementar,
    calcular_arcano_pessoal,
    obter_arcanos,
    reduzir_arcano,
)


@pytest.mark.parametrize("numero, esperado", [(0, 22), (7, 7), (22, 22), (23, 5), (2013, 6), (1999, 10)])
def test_reduzir_arcano(numero, esperado):
    assert reduzir_arcano(numero) == esperado


def test_arcano_pessoal_soma_dia_mes_e_ano():
    assert calcular_arcano_pessoal(date(1990, 8, 15)) == 6
    assert calcular_arcano_pessoal(date(1985, 12, 31)) == 12


def test_arcano_pessoal_rejeita_entrada_invalida():
    with pytest.raises(ArcanoPessoalError):
        calcular_arcano_pessoal("1990-08-15")


@pytest.mark.parametrize("pessoal, esperado", [(6, None), (9, None), (10, 1), (15, 6), (19, 10), (22, 4)])
def test_arcano_complementar(pessoal, esperado):
    assert calcular_arcano_complementar(pessoal) == esperado


def test_arcano_anual_usa_ano_informado():
    assert calcular_arcano_anual(date(1990, 8, 15), 2026) == 15
    assert calcular_arcano_anual(date(1990, 8, 15), 2027) == 7


def test_obter_arcanos_monta_os_tres():
    arcanos = obter_arcanos(date(1985, 12, 31), 2026)
    assert arcanos["pessoal"]["numero"] == 12
    assert arcanos["complementar"]["numero"] == 3
    assert arcanos["anual"]["numero"] == 17 and arcanos["anual"]["ano"] == 2026
    assert arcanos["pessoal"]["imagem_carta"].startswith("/images/arcanos/12-")


def test_obter_arcanos_sem_complementar():
    assert obter_arcanos(date(1990, 8, 15), 2026)["complementar"] is None
