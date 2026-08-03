"""Busca local de municípios brasileiros e conversão temporal."""

import json
import re
import unicodedata
from datetime import date, datetime, time, timezone
from functools import lru_cache
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "cidades_brasil.json"


def normalizar(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", str(texto))
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return " ".join(re.sub(r"[^a-z0-9]+", " ", texto.casefold()).split())


@lru_cache(maxsize=1)
def carregar_cidades() -> tuple[dict, ...]:
    with DATA_PATH.open(encoding="utf-8") as arquivo:
        registros = json.load(arquivo)

    cidades = []
    for registro in registros:
        cidade = dict(registro)
        cidade["_busca"] = normalizar(f"{cidade['municipio']} {cidade['uf']}")
        cidades.append(cidade)
    return tuple(cidades)


@lru_cache(maxsize=1)
def _cidades_por_ibge() -> dict[str, dict]:
    return {cidade["ibge"]: cidade for cidade in carregar_cidades()}


def _publicar(cidade: dict) -> dict:
    return {chave: valor for chave, valor in cidade.items() if not chave.startswith("_")}


def listar_cidades_brasil(filtro: str, limite: int = 10) -> list[dict]:
    termo = normalizar(filtro)
    if len(termo) < 2:
        return []

    limite = max(1, min(int(limite), 20))
    resultados = [cidade for cidade in carregar_cidades() if termo in cidade["_busca"]]
    resultados.sort(
        key=lambda cidade: (
            not cidade["_busca"].startswith(termo),
            cidade["municipio"],
            cidade["uf"],
        )
    )
    return [_publicar(cidade) for cidade in resultados[:limite]]


def buscar_cidade_por_ibge(codigo: str | int) -> dict | None:
    cidade = _cidades_por_ibge().get(str(codigo).strip())
    return _publicar(cidade) if cidade else None


def resolver_localizacao(cidade_ibge: str | int) -> dict | None:
    cidade = buscar_cidade_por_ibge(cidade_ibge)
    if cidade is None:
        return None
    return {
        **cidade,
        "local_nascimento": f"{cidade['municipio']}, {cidade['uf']}",
    }


def converter_nascimento_para_utc(
    data_nascimento: date,
    horario_nascimento: time,
    timezone_id: str,
) -> dict:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

    try:
        fuso = ZoneInfo(timezone_id)
    except ZoneInfoNotFoundError as erro:
        raise ValueError("Fuso horário desconhecido.") from erro

    horario_local = datetime.combine(data_nascimento, horario_nascimento, tzinfo=fuso)
    horario_utc = horario_local.astimezone(timezone.utc)
    offset = horario_local.utcoffset()
    dst = horario_local.dst()
    return {
        "local": horario_local,
        "utc": horario_utc,
        "utc_offset_minutos": int(offset.total_seconds() // 60) if offset else 0,
        "dst": bool(dst and dst.total_seconds()),
    }
