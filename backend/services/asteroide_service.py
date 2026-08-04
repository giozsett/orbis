"""Cálculo dos cinco corpos menores exibidos no menu técnico."""

from datetime import datetime, timedelta, timezone
from pathlib import Path

import swisseph as swe

from backend.models.mapa_natal import MapaNatal
from backend.services.mapa_natal_service import _casa, _ponto


CAMINHO_EFEMERIDES = Path(__file__).resolve().parents[1] / "data" / "ephemeris"
ASTEROIDES = (
    ("Quíron", swe.CHIRON, "Feridas simbólicas que podem se transformar em aprendizado e cuidado."),
    ("Ceres", swe.CERES, "Formas de nutrir, acolher e construir autonomia nos ciclos de cuidado."),
    ("Palas", swe.PALLAS, "Reconhecimento de padrões, estratégia e inteligência criativa."),
    ("Juno", swe.JUNO, "Compromissos, reciprocidade e acordos importantes nas relações."),
    ("Vesta", swe.VESTA, "Foco, devoção e preservação daquilo que tem valor interior."),
)


class AsteroideCalculoError(RuntimeError):
    pass


def calcular_asteroides_mapa(mapa: MapaNatal) -> list[dict]:
    dados = mapa.dados or {}
    casas = dados.get("casas") or []
    cuspides = tuple(float(item["grau"]) for item in casas if "grau" in item)
    if len(cuspides) != 12:
        raise AsteroideCalculoError("O mapa não possui as doze cúspides necessárias.")

    instante = _instante_utc(mapa)
    if not 1800 <= instante.year <= 2399:
        raise AsteroideCalculoError(
            "As efemérides de asteroides disponíveis cobrem os anos de 1800 a 2399."
        )
    hora = instante.hour + instante.minute / 60 + instante.second / 3600
    dia_juliano = swe.julday(
        instante.year, instante.month, instante.day, hora, swe.GREG_CAL
    )
    swe.set_ephe_path(str(CAMINHO_EFEMERIDES))
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    resultado = []
    try:
        for nome, codigo, interpretacao in ASTEROIDES:
            posicao, _ = swe.calc_ut(dia_juliano, codigo, flags)
            item = _ponto(nome, posicao[0])
            item.update({
                "casa": _casa(posicao[0], cuspides),
                "retrogrado": posicao[3] < 0,
                "interpretacao": interpretacao,
            })
            resultado.append(item)
    except swe.Error as erro:
        raise AsteroideCalculoError(
            "Não foi possível consultar as efemérides de asteroides."
        ) from erro
    return resultado


def _instante_utc(mapa: MapaNatal) -> datetime:
    valor = (mapa.dados or {}).get("data_hora_utc")
    if valor:
        instante = datetime.fromisoformat(valor)
        if instante.tzinfo is None:
            instante = instante.replace(tzinfo=timezone.utc)
        return instante.astimezone(timezone.utc)

    local = datetime.combine(mapa.data_nascimento, mapa.horario_nascimento)
    deslocamento = timedelta(minutes=mapa.utc_offset_minutos or 0)
    return (local - deslocamento).replace(tzinfo=timezone.utc)
