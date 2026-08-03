from backend.services.mapa_natal_service import calcular_mapa_natal


def test_calcula_planetas_casas_ascendente_mc_e_aspectos():
    mapa = calcular_mapa_natal({
        "data_nascimento": "1990-01-01",
        "horario_nascimento": "12:00",
        "latitude": -23.5329,
        "longitude": -46.6395,
        "timezone_id": "America/Sao_Paulo",
    })

    assert mapa["sistema_casas"] == "Placidus"
    assert mapa["data_hora_utc"] == "1990-01-01T14:00:00+00:00"
    assert len(mapa["planetas"]) == 11
    assert len(mapa["casas"]) == 12
    assert 0 <= mapa["ascendente"]["grau"] < 360
    assert 0 <= mapa["meio_do_ceu"]["grau"] < 360
    assert all(1 <= planeta["casa"] <= 12 for planeta in mapa["planetas"])
    assert mapa["aspectos"]


def test_calculo_considera_horario_de_verao_historico():
    mapa = calcular_mapa_natal({
        "data_nascimento": "2018-01-15",
        "horario_nascimento": "12:00",
        "latitude": -23.5329,
        "longitude": -46.6395,
        "timezone_id": "America/Sao_Paulo",
    })
    assert mapa["utc_offset_minutos"] == -120
    assert mapa["dst"] is True
    assert mapa["data_hora_utc"] == "2018-01-15T14:00:00+00:00"
