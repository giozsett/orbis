"""Busca local de cidades brasileiras e internacionais e conversão temporal."""

import json
import re
import unicodedata
from datetime import date, datetime, time, timezone
from functools import lru_cache
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_PATH = DATA_DIR / "cidades_brasil.json"
DATA_MUNDO_PATH = DATA_DIR / "cidades_mundo.json"
DATA_PAISES_PATH = DATA_DIR / "paises.json"


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


def _publicar_brasil(cidade: dict) -> dict:
    return {
        **_publicar(cidade),
        "id": cidade["ibge"],
        "nome": cidade["municipio"],
        "subdivisao": cidade["uf"],
        "pais_codigo": "BR",
        "pais_nome": "Brasil",
    }


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
    return [_publicar_brasil(cidade) for cidade in resultados[:limite]]


def buscar_cidade_por_ibge(codigo: str | int) -> dict | None:
    cidade = _cidades_por_ibge().get(str(codigo).strip())
    return _publicar_brasil(cidade) if cidade else None


@lru_cache(maxsize=1)
def carregar_paises() -> tuple[dict, ...]:
    with DATA_PAISES_PATH.open(encoding="utf-8") as arquivo:
        return tuple(json.load(arquivo))


@lru_cache(maxsize=1)
def _paises_por_codigo() -> dict[str, dict]:
    return {pais["codigo"]: pais for pais in carregar_paises()}


@lru_cache(maxsize=1)
def carregar_cidades_mundo() -> tuple[dict, ...]:
    with DATA_MUNDO_PATH.open(encoding="utf-8") as arquivo:
        registros = json.load(arquivo)
    return tuple({
        **cidade,
        "_busca": normalizar(f"{cidade['nome']} {cidade.get('nome_ascii', '')} {cidade.get('subdivisao', '')}"),
    } for cidade in registros)


@lru_cache(maxsize=1)
def _cidades_mundo_por_pais() -> dict[str, tuple[dict, ...]]:
    agrupadas = {}
    for cidade in carregar_cidades_mundo():
        agrupadas.setdefault(cidade["pais_codigo"], []).append(cidade)
    return {codigo: tuple(cidades) for codigo, cidades in agrupadas.items()}


@lru_cache(maxsize=1)
def _cidades_mundo_por_id() -> dict[tuple[str, str], dict]:
    return {
        (cidade["pais_codigo"], cidade["id"]): cidade
        for cidade in carregar_cidades_mundo()
    }


def listar_paises() -> list[dict]:
    return [dict(pais) for pais in carregar_paises()]


def listar_cidades(filtro: str, pais_codigo: str = "BR", limite: int = 10) -> list[dict]:
    pais_codigo = str(pais_codigo or "BR").strip().upper()
    if pais_codigo == "BR":
        return listar_cidades_brasil(filtro, limite)
    termo = normalizar(filtro)
    if len(termo) < 2:
        return []
    limite = max(1, min(int(limite), 20))
    resultados = [
        cidade for cidade in _cidades_mundo_por_pais().get(pais_codigo, ())
        if termo in cidade["_busca"]
    ]
    resultados.sort(key=lambda cidade: (
        not cidade["_busca"].startswith(termo), -cidade["populacao"], cidade["nome"],
    ))
    pais = _paises_por_codigo().get(pais_codigo, {})
    return [
        {**_publicar(cidade), "pais_nome": pais.get("nome", pais_codigo)}
        for cidade in resultados[:limite]
    ]


def buscar_cidade(codigo: str | int, pais_codigo: str = "BR") -> dict | None:
    pais_codigo = str(pais_codigo or "BR").strip().upper()
    if pais_codigo == "BR":
        return buscar_cidade_por_ibge(codigo)
    cidade = _cidades_mundo_por_id().get((pais_codigo, str(codigo).strip()))
    if cidade is None:
        return None
    pais = _paises_por_codigo().get(pais_codigo, {})
    return {**_publicar(cidade), "pais_nome": pais.get("nome", pais_codigo)}


def resolver_localizacao(cidade_id: str | int, pais_codigo: str = "BR") -> dict | None:
    cidade = buscar_cidade(cidade_id, pais_codigo)
    if cidade is None:
        return None
    if cidade["pais_codigo"] != "BR":
        partes = [cidade["nome"], cidade.get("subdivisao"), cidade.get("pais_nome")]
        return {
            **cidade,
            "geoname_id": cidade["id"],
            "cidade_id": cidade["id"],
            "local_nascimento": ", ".join(parte for parte in partes if parte),
        }
    return {
        **cidade,
        "cidade_id": cidade["ibge"],
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
