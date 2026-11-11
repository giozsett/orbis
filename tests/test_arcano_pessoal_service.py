from datetime import date

import pytest

from backend.services.arcano_pessoal_service import (
    ArcanoPessoalError,
    ano_do_ciclo,
    calcular_arcano_anual,
    calcular_arcano_complementar,
    calcular_arcano_pessoal,
    obter_arcanos,
    reduzir_arcano,
)


@pytest.mark.parametrize("numero, esperado", [(0, 22), (7, 7), (22, 22), (23, 5), (2013, 6), (1999, 10)])
def test_reduzir_arcano(numero, esperado):
    assert reduzir_arcano(numero) == esperado


@pytest.mark.parametrize(
    "data, esperado",
    [
        # conferidos em outras plataformas: soma algarismo por algarismo de DD/MM/AAAA
        (date(2001, 4, 16), 14),  # 1+6+0+4+2+0+0+1 = 14, A Temperança (dia+mês+ano daria 5)
        (date(1977, 5, 17), 10),  # 1+7+0+5+1+9+7+7 = 37 → 10, A Roda da Fortuna
        (date(1970, 3, 15), 8),   # 1+5+0+3+1+9+7+0 = 26 → 8
        (date(1985, 12, 31), 3),  # 3+1+1+2+1+9+8+5 = 30 → 3
        (date(1990, 8, 15), 6),   # 1+5+0+8+1+9+9+0 = 33 → 6
    ],
)
def test_arcano_pessoal_soma_os_algarismos_da_data(data, esperado):
    assert calcular_arcano_pessoal(data) == esperado


def test_arcano_pessoal_rejeita_entrada_invalida():
    with pytest.raises(ArcanoPessoalError):
        calcular_arcano_pessoal("1990-08-15")


@pytest.mark.parametrize("pessoal, esperado", [(6, None), (9, None), (10, 1), (14, 5), (15, 6), (19, 10), (22, 4)])
def test_arcano_complementar(pessoal, esperado):
    assert calcular_arcano_complementar(pessoal) == esperado


def test_arcano_anual_soma_algarismos_de_dia_mes_e_ano_do_ciclo():
    assert calcular_arcano_anual(date(1990, 8, 15), 2026) == 6   # 1+5+0+8+2+0+2+6 = 24 → 6
    assert calcular_arcano_anual(date(1990, 8, 15), 2027) == 7   # 25 → 7
    assert calcular_arcano_anual(date(2001, 4, 16), 2026) == 21  # 1+6+0+4+2+0+2+6 = 21


@pytest.mark.parametrize(
    "hoje, esperado",
    [
        (date(2026, 4, 15), 2025),  # véspera do aniversário: ainda no ciclo anterior
        (date(2026, 4, 16), 2026),  # no dia do aniversário começa o novo ciclo
        (date(2026, 11, 11), 2026),
    ],
)
def test_ano_do_ciclo_comeca_no_aniversario(hoje, esperado):
    assert ano_do_ciclo(date(2001, 4, 16), hoje) == esperado


def test_obter_arcanos_monta_os_tres():
    arcanos = obter_arcanos(date(2001, 4, 16), 2026)
    assert arcanos["pessoal"]["numero"] == 14
    assert arcanos["complementar"]["numero"] == 5
    assert arcanos["anual"]["numero"] == 21 and arcanos["anual"]["ano"] == 2026
    assert arcanos["pessoal"]["imagem_carta"].startswith("/images/arcanos/14-")


def test_obter_arcanos_sem_complementar():
    assert obter_arcanos(date(1990, 8, 15), 2026)["complementar"] is None
