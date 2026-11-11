from datetime import date

import pytest

from backend.services.arcano_pessoal_service import ArcanoPessoalError
from backend.services.matriz_destino_service import calcular_matriz_destino


def test_pontos_principais():
    pontos = calcular_matriz_destino(date(1990, 8, 15))["pontos"]
    assert {k: pontos[k] for k in "ABCDEFGHI"} == {
        "A": 15, "B": 8, "C": 19, "D": 6, "E": 12, "F": 5, "G": 9, "H": 7, "I": 21,
    }
    assert (pontos["A2"], pontos["A1"], pontos["A3"]) == (9, 6, 21)
    assert (pontos["C2"], pontos["D2"], pontos["X"]) == (4, 18, 22)
    assert (pontos["dinheiro"], pontos["amor"]) == (8, 4)


def test_dia_e_ano_acima_de_22_sao_reduzidos():
    pontos = calcular_matriz_destino(date(2004, 3, 29))["pontos"]
    assert (pontos["A"], pontos["B"], pontos["C"]) == (11, 3, 6)
    assert pontos["D"] == 20
    assert pontos["E"] == 4


def test_propositos():
    proposito = calcular_matriz_destino(date(1990, 8, 15))["proposito"]
    assert proposito == {
        "ceu": 14, "terra": 7, "pessoal": 21,
        "masculina": 12, "feminina": 3, "social": 15, "espiritual": 9,
    }


def test_linha_do_tempo_cobre_80_anos():
    idades = calcular_matriz_destino(date(1990, 8, 15))["idades"]
    assert len(idades) == 64
    assert [i["idade"] for i in idades if i["vertice"]] == [0, 10, 20, 30, 40, 50, 60, 70]
    assert idades[4] == {"idade": 5, "arcano": 20, "vertice": False}  # meio de A e F: 15 + 5
    assert all(1 <= i["arcano"] <= 22 for i in idades)


def test_chakras():
    matriz = calcular_matriz_destino(date(1990, 8, 15))
    chakras = matriz["chakras"]
    assert [c["id"] for c in chakras][0] == "sahasrara" and len(chakras) == 7
    assert (chakras[0]["fisico"], chakras[0]["energia"], chakras[0]["emocoes"]) == (15, 8, 5)
    assert (chakras[4]["fisico"], chakras[4]["energia"]) == (12, 12)
    assert matriz["chakras_total"] == {"fisico": 14, "energia": 16, "emocoes": 3}


def test_entrada_invalida():
    with pytest.raises(ArcanoPessoalError):
        calcular_matriz_destino(None)


def test_confere_com_exemplo_de_referencia():
    # exemplo de 07/01/1987 do destiny-matrix.cc: J = A + E e Q = A + J
    pontos = calcular_matriz_destino(date(1987, 1, 7))["pontos"]
    assert {k: pontos[k] for k in "ABCDEFGHI"} == {
        "A": 7, "B": 1, "C": 7, "D": 15, "E": 3, "F": 8, "G": 8, "H": 22, "I": 22,
    }
    assert (pontos["A2"], pontos["B2"], pontos["C2"], pontos["D2"]) == (10, 4, 10, 18)
    assert (pontos["A1"], pontos["B1"], pontos["C1"], pontos["D1"]) == (17, 5, 17, 6)
    assert (pontos["X"], pontos["amor"], pontos["dinheiro"]) == (10, 10, 20)


def test_cauda_carmica_lida_do_centro_para_fora():
    # exemplo de 17/08/1992 do destiny-matrix.cc: cauda 21-4-10
    assert calcular_matriz_destino(date(1992, 8, 17))["canais"]["cauda_carmica"] == [21, 4, 10]
