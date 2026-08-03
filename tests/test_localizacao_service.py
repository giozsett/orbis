from datetime import date, time

from backend.services.localizacao_service import (
    buscar_cidade_por_ibge,
    converter_nascimento_para_utc,
    listar_cidades_brasil,
    normalizar,
    resolver_localizacao,
)


def test_normaliza_acentos_caixa_e_pontuacao():
    assert normalizar("  São-Paulo, SP ") == "sao paulo sp"


def test_busca_cidade_sem_acento():
    resultados = listar_cidades_brasil("sao paulo", 10)
    assert resultados[0]["ibge"] == "3550308"
    assert "_busca" not in resultados[0]


def test_busca_exige_dois_caracteres():
    assert listar_cidades_brasil("s") == []


def test_resolve_exclusivamente_por_codigo_ibge():
    cidade = resolver_localizacao("3550308")
    assert cidade["local_nascimento"] == "São Paulo, SP"
    assert cidade["timezone_id"] == "America/Sao_Paulo"
    assert buscar_cidade_por_ibge("0000000") is None


def test_offset_historico_e_dst_sao_calculados_pela_data():
    verao = converter_nascimento_para_utc(
        date(2018, 1, 15), time(12), "America/Sao_Paulo"
    )
    inverno = converter_nascimento_para_utc(
        date(2018, 7, 15), time(12), "America/Sao_Paulo"
    )
    assert verao["utc_offset_minutos"] == -120
    assert verao["dst"] is True
    assert inverno["utc_offset_minutos"] == -180
    assert inverno["dst"] is False
