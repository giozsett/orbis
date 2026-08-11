"""Cálculo determinístico do mapa natal com Swiss Ephemeris."""

from datetime import date, time
from math import isclose

import swisseph as swe

from backend.services.localizacao_service import converter_nascimento_para_utc
from backend.services.interpretacao_base_service import gerar_interpretacao_base


SIGNOS = (
    "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
    "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
)

PLANETAS = (
    ("Sol", swe.SUN),
    ("Lua", swe.MOON),
    ("Mercúrio", swe.MERCURY),
    ("Vênus", swe.VENUS),
    ("Marte", swe.MARS),
    ("Júpiter", swe.JUPITER),
    ("Saturno", swe.SATURN),
    ("Urano", swe.URANUS),
    ("Netuno", swe.NEPTUNE),
    ("Plutão", swe.PLUTO),
    ("Nodo Norte", swe.TRUE_NODE),
)

ASPECTOS = (
    ("conjunção", 0, 8),
    ("sextil", 60, 5),
    ("quadratura", 90, 7),
    ("trígono", 120, 7),
    ("oposição", 180, 8),
)


def _signo(longitude: float) -> tuple[str, float]:
    longitude %= 360
    return SIGNOS[int(longitude // 30)], longitude % 30


def _casa(longitude: float, cuspides: tuple[float, ...]) -> int:
    longitude %= 360
    for indice, inicio in enumerate(cuspides):
        fim = cuspides[(indice + 1) % 12]
        arco = (fim - inicio) % 360
        distancia = (longitude - inicio) % 360
        if distancia < arco or isclose(distancia, 0, abs_tol=1e-9):
            return indice + 1
    return 12


def _ponto(nome: str, longitude: float) -> dict:
    signo, grau_signo = _signo(longitude)
    return {
        "nome": nome,
        "signo": signo,
        "grau": round(longitude % 360, 6),
        "grau_signo": round(grau_signo, 6),
        "posicao": f"{int(grau_signo):02d}° {int((grau_signo % 1) * 60):02d}'",
    }


def _calcular_aspectos(planetas: list[dict]) -> list[dict]:
    aspectos = []
    for indice, primeiro in enumerate(planetas):
        for segundo in planetas[indice + 1:]:
            distancia = abs(primeiro["grau"] - segundo["grau"]) % 360
            distancia = min(distancia, 360 - distancia)
            for tipo, angulo, orbe_maximo in ASPECTOS:
                orbe = abs(distancia - angulo)
                if orbe <= orbe_maximo:
                    aspectos.append({
                        "tipo": tipo,
                        "angulo": angulo,
                        "orbe": round(orbe, 4),
                        "planeta1": {"nome": primeiro["nome"], "grau": primeiro["grau"]},
                        "planeta2": {"nome": segundo["nome"], "grau": segundo["grau"]},
                    })
                    break
    return aspectos


def calcular_mapa_natal(dados: dict) -> dict:
    data_nascimento = dados["data_nascimento"]
    horario_nascimento = dados["horario_nascimento"]
    if isinstance(data_nascimento, str):
        data_nascimento = date.fromisoformat(data_nascimento)
    if isinstance(horario_nascimento, str):
        horario_nascimento = time.fromisoformat(horario_nascimento)

    nascimento = converter_nascimento_para_utc(
        data_nascimento,
        horario_nascimento,
        dados["timezone_id"],
    )
    utc = nascimento["utc"]
    hora_decimal = utc.hour + utc.minute / 60 + (utc.second + utc.microsecond / 1_000_000) / 3600
    dia_juliano = swe.julday(utc.year, utc.month, utc.day, hora_decimal, swe.GREG_CAL)

    latitude = float(dados["latitude"])
    longitude = float(dados["longitude"])
    cuspides, ascmc = swe.houses(dia_juliano, latitude, longitude, b"P")
    if len(cuspides) == 13:
        cuspides = cuspides[1:]

    planetas = []
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    for nome, codigo in PLANETAS:
        posicao = swe.calc_ut(dia_juliano, codigo, flags)[0]
        planeta = _ponto(nome, posicao[0])
        planeta.update({
            "casa": _casa(posicao[0], cuspides),
            "latitude_ecliptica": round(posicao[1], 6),
            "retrogrado": posicao[3] < 0,
        })
        planeta["interpretacao_base"] = gerar_interpretacao_base(
            planeta["nome"],
            planeta["signo"],
            planeta["casa"],
        )
        planetas.append(planeta)

    ascendente = _ponto("Ascendente", ascmc[0])
    meio_do_ceu = _ponto("Meio do Céu", ascmc[1])
    casas = [
        {"numero": numero, **_ponto(f"Casa {numero}", cuspide)}
        for numero, cuspide in enumerate(cuspides, start=1)
    ]

    return {
        "sistema_casas": "Placidus",
        "data_hora_utc": utc.isoformat(),
        "dia_juliano": round(dia_juliano, 8),
        "timezone_id": dados["timezone_id"],
        "utc_offset_minutos": nascimento["utc_offset_minutos"],
        "dst": nascimento["dst"],
        "latitude": latitude,
        "longitude": longitude,
        "planetas": planetas,
        "ascendente": ascendente,
        "meio_do_ceu": meio_do_ceu,
        "casas": casas,
        "aspectos": _calcular_aspectos(planetas),
    }
