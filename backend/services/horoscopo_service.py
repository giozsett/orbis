"""Geração e cache do horóscopo personalizado do mapa principal."""

from __future__ import annotations

import calendar
import json
from copy import deepcopy
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import swisseph as swe
from flask import current_app

from backend.app.database import db
from backend.models.mapa_natal import MapaNatal
from backend.services.mapa_natal_service import ASPECTOS, PLANETAS, _signo
from backend.services.modelo_config_service import obter_modelos
from backend.services.openrouter_service import completar


PERIODOS = ("diario", "semanal", "quinzenal", "mensal")
ROTULOS_PERIODOS = {
    "diario": "Hoje",
    "semanal": "Semana",
    "quinzenal": "Quinzena",
    "mensal": "Mês",
}
AVISO = (
    "Conteúdo simbólico para reflexão e entretenimento; não substitui "
    "orientação médica, financeira, jurídica ou psicológica."
)
ENERGIA_POR_TENDENCIA = {
    "alta": 75,
    "estavel": 55,
    "baixa": 35,
}


class HoroscopoError(RuntimeError):
    """Erro base do domínio de horóscopo."""


class MapaPrincipalNaoEncontrado(HoroscopoError):
    """O usuário ainda não possui mapa principal concluído."""


class PeriodoInvalido(HoroscopoError):
    """Periodicidade não suportada."""


class HoroscopoGeracaoError(HoroscopoError):
    """O modelo não devolveu o contrato de dados esperado."""


def data_local_atual() -> date:
    nome_timezone = current_app.config.get("HOROSCOPO_TIMEZONE", "America/Sao_Paulo")
    try:
        fuso = ZoneInfo(nome_timezone)
    except ZoneInfoNotFoundError:
        fuso = timezone.utc
    return datetime.now(fuso).date()


def limites_periodo(periodo: str, referencia: date) -> dict:
    if periodo not in PERIODOS:
        raise PeriodoInvalido(
            "Período inválido. Use diario, semanal, quinzenal ou mensal."
        )

    if periodo == "diario":
        inicio = fim = referencia
    elif periodo == "semanal":
        inicio = referencia - timedelta(days=referencia.weekday())
        fim = inicio + timedelta(days=6)
    elif periodo == "quinzenal":
        primeiro_dia = 1 if referencia.day <= 15 else 16
        ultimo_dia = 15 if referencia.day <= 15 else calendar.monthrange(
            referencia.year, referencia.month
        )[1]
        inicio = referencia.replace(day=primeiro_dia)
        fim = referencia.replace(day=ultimo_dia)
    else:
        inicio = referencia.replace(day=1)
        fim = referencia.replace(
            day=calendar.monthrange(referencia.year, referencia.month)[1]
        )

    return {
        "id": periodo,
        "rotulo": ROTULOS_PERIODOS[periodo],
        "chave": f"{periodo}:{inicio.isoformat()}:{fim.isoformat()}",
        "inicio": inicio.isoformat(),
        "fim": fim.isoformat(),
    }


def buscar_mapa_principal(usuario_id: int) -> MapaNatal:
    mapa = (
        MapaNatal.query.filter_by(usuario_id=usuario_id, status="concluido")
        .order_by(MapaNatal.criado_em.asc(), MapaNatal.id.asc())
        .first()
    )
    if mapa is None:
        raise MapaPrincipalNaoEncontrado(
            "Crie seu mapa principal antes de gerar o horóscopo."
        )
    return mapa


def listar_horoscopos(usuario_id: int, *, referencia: date | None = None) -> dict:
    mapa = buscar_mapa_principal(usuario_id)
    referencia = referencia or data_local_atual()
    armazenados = (mapa.horoscopo_dados or {}).get("periodos", {})
    periodos = []
    horoscopos = {}

    for periodo in PERIODOS:
        limites = limites_periodo(periodo, referencia)
        item = armazenados.get(periodo)
        disponivel = bool(item and item.get("chave") == limites["chave"])
        periodos.append({**limites, "disponivel": disponivel})
        if disponivel:
            horoscopos[periodo] = _normalizar_horoscopo_armazenado(item)

    return {
        "mapa": {
            "id": mapa.id,
            "nome": mapa.nome or "Meu mapa natal",
        },
        "periodos": periodos,
        "horoscopos": horoscopos,
        "aviso": AVISO,
    }


def gerar_horoscopo(
    usuario_id: int,
    periodo: str = "diario",
    *,
    forcar: bool = False,
    referencia: date | None = None,
) -> tuple[dict, bool]:
    mapa = buscar_mapa_principal(usuario_id)
    referencia = referencia or data_local_atual()
    limites = limites_periodo(periodo, referencia)
    documento = deepcopy(mapa.horoscopo_dados or {"versao": 1, "periodos": {}})
    documento.setdefault("versao", 1)
    armazenados = documento.setdefault("periodos", {})
    existente = armazenados.get(periodo)

    if not forcar and existente and existente.get("chave") == limites["chave"]:
        return _normalizar_horoscopo_armazenado(existente), True

    modelos = obter_modelos("horoscopo")
    modelo = modelos[0]
    contexto = _contexto_astral(mapa.dados or {}, limites)
    mensagens = _montar_mensagens(mapa, limites, contexto)
    resposta = completar(
        mensagens,
        modelo,
        modelos_fallback=modelos[1:],
        temperatura=0.55,
        max_tokens=1600,
        formato_json=True,
    )
    conteudo = _validar_conteudo(_extrair_json(resposta))

    item = {
        **limites,
        **conteudo,
        "modelo": modelo,
        "gerado_em": datetime.now(timezone.utc).isoformat(),
        "aviso": AVISO,
    }
    armazenados[periodo] = item
    mapa.horoscopo_dados = documento
    db.session.commit()
    return item, False


def _contexto_astral(dados_natais: dict, limites: dict) -> dict:
    inicio = date.fromisoformat(limites["inicio"])
    fim = date.fromisoformat(limites["fim"])
    meio = inicio + timedelta(days=(fim - inicio).days // 2)
    referencias = []
    for valor in (inicio, meio, fim):
        if valor not in referencias:
            referencias.append(valor)

    return {
        "mapa_natal": _resumo_mapa_natal(dados_natais),
        "transitos": [
            _calcular_transitos(dados_natais, valor)
            for valor in referencias
        ],
    }


def _resumo_mapa_natal(dados: dict) -> dict:
    return {
        "sistema_casas": dados.get("sistema_casas"),
        "ascendente": dados.get("ascendente"),
        "meio_do_ceu": dados.get("meio_do_ceu"),
        "planetas": [
            {
                "nome": planeta.get("nome"),
                "signo": planeta.get("signo"),
                "grau": planeta.get("grau"),
                "casa": planeta.get("casa"),
                "retrogrado": planeta.get("retrogrado", False),
            }
            for planeta in dados.get("planetas", [])
        ],
    }


def _calcular_transitos(dados_natais: dict, referencia: date) -> dict:
    hora_decimal = 12.0
    dia_juliano = swe.julday(
        referencia.year, referencia.month, referencia.day, hora_decimal, swe.GREG_CAL
    )
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    planetas_transito = []

    for nome, codigo in PLANETAS:
        posicao, _ = swe.calc_ut(dia_juliano, codigo, flags)
        signo, grau_signo = _signo(posicao[0])
        planetas_transito.append({
            "nome": nome,
            "signo": signo,
            "grau": round(posicao[0] % 360, 4),
            "grau_signo": round(grau_signo, 2),
            "retrogrado": posicao[3] < 0,
        })

    aspectos = []
    natais = [
        planeta for planeta in dados_natais.get("planetas", [])
        if isinstance(planeta.get("grau"), (int, float))
    ]
    for transito in planetas_transito:
        for natal in natais:
            distancia = abs(transito["grau"] - float(natal["grau"])) % 360
            distancia = min(distancia, 360 - distancia)
            for tipo, angulo, _orbe_natal in ASPECTOS:
                orbe_maximo = 3.0 if tipo != "sextil" else 2.5
                orbe = abs(distancia - angulo)
                if orbe <= orbe_maximo:
                    aspectos.append({
                        "transito": transito["nome"],
                        "aspecto": tipo,
                        "natal": natal.get("nome"),
                        "orbe": round(orbe, 2),
                    })
                    break

    aspectos.sort(key=lambda item: item["orbe"])
    return {
        "data": referencia.isoformat(),
        "posicoes": planetas_transito,
        "aspectos_com_mapa_natal": aspectos[:12],
    }


def _montar_mensagens(mapa: MapaNatal, limites: dict, contexto: dict) -> list[dict]:
    contrato = {
        "titulo": "frase curta para o ciclo",
        "resumo": "um parágrafo breve com no máximo 55 palavras",
        "conselho": "orientação prática com no máximo 45 palavras",
        "destaque_astral": "um trânsito real presente nos dados, sem inventar",
        "palavras_chave": ["três", "termos", "curtos"],
        "areas": [
            {
                "nome": "Amor",
                "texto": "no máximo 40 palavras",
                "energia": 68,
                "tendencia": "alta, estavel ou baixa",
            },
            {
                "nome": "Trabalho",
                "texto": "no máximo 40 palavras",
                "energia": 61,
                "tendencia": "alta, estavel ou baixa",
            },
            {
                "nome": "Bem-estar",
                "texto": "no máximo 40 palavras",
                "energia": 57,
                "tendencia": "alta, estavel ou baixa",
            },
        ],
    }
    return [
        {
            "role": "system",
            "content": (
                "Você é o redator astrológico do ORBIS. Escreva em português do "
                "Brasil, com tom acolhedor, sóbrio e breve. Baseie toda menção "
                "astrológica exclusivamente no mapa e nos trânsitos fornecidos. "
                "Não invente aspectos, não faça previsões deterministas e não dê "
                "aconselhamento médico, jurídico ou financeiro. Trate astrologia "
                "como linguagem simbólica de reflexão. Responda somente com JSON "
                "válido, sem markdown."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Gere o horóscopo {limites['id']} do mapa principal "
                f"'{mapa.nome or 'Meu mapa natal'}', válido de "
                f"{limites['inicio']} a {limites['fim']}.\n\n"
                f"DADOS ASTRAIS:\n{json.dumps(contexto, ensure_ascii=False)}\n\n"
                f"CONTRATO EXATO:\n{json.dumps(contrato, ensure_ascii=False)}\n\n"
                "Os números de energia acima são somente exemplos de formato. "
                "Calcule para cada área um inteiro próprio entre 1 e 100, coerente "
                "com a tendência e diferente de zero."
            ),
        },
    ]


def _extrair_json(texto: str) -> dict:
    texto = texto.strip()
    if texto.startswith("```"):
        linhas = texto.splitlines()
        texto = "\n".join(linhas[1:-1]).strip()
    inicio = texto.find("{")
    fim = texto.rfind("}")
    if inicio < 0 or fim <= inicio:
        raise HoroscopoGeracaoError("O modelo não retornou um objeto JSON.")
    try:
        dados = json.loads(texto[inicio: fim + 1])
    except json.JSONDecodeError as erro:
        raise HoroscopoGeracaoError("O modelo retornou JSON inválido.") from erro
    if not isinstance(dados, dict):
        raise HoroscopoGeracaoError("A resposta do modelo possui formato inválido.")
    return dados


def _validar_conteudo(dados: dict) -> dict:
    campos_texto = ("titulo", "resumo", "conselho", "destaque_astral")
    resultado = {}
    for campo in campos_texto:
        valor = str(dados.get(campo, "")).strip()
        if not valor:
            raise HoroscopoGeracaoError(f"O modelo não preencheu o campo '{campo}'.")
        resultado[campo] = valor

    palavras = dados.get("palavras_chave")
    if not isinstance(palavras, list) or len(palavras) < 3:
        raise HoroscopoGeracaoError("O modelo não retornou três palavras-chave.")
    resultado["palavras_chave"] = [str(item).strip() for item in palavras[:3]]

    areas_recebidas = dados.get("areas")
    if not isinstance(areas_recebidas, list):
        raise HoroscopoGeracaoError("O modelo não retornou as áreas do horóscopo.")
    por_nome = {
        str(item.get("nome", "")).casefold(): item
        for item in areas_recebidas
        if isinstance(item, dict)
    }
    areas = []
    for nome in ("Amor", "Trabalho", "Bem-estar"):
        item = por_nome.get(nome.casefold())
        if not item:
            raise HoroscopoGeracaoError(f"O modelo não retornou a área '{nome}'.")
        texto = str(item.get("texto", "")).strip()
        if not texto:
            raise HoroscopoGeracaoError(f"A área '{nome}' está sem texto.")
        try:
            energia = int(float(item.get("energia", 50)))
        except (TypeError, ValueError):
            energia = 50
        tendencia = str(item.get("tendencia", "estavel")).casefold().strip()
        if tendencia not in {"alta", "estavel", "baixa"}:
            tendencia = "estavel"
        areas.append({
            "nome": nome,
            "texto": texto,
            "energia": max(0, min(100, energia)),
            "tendencia": tendencia,
        })
    resultado["areas"] = _normalizar_energias_areas(areas)
    return resultado


def _normalizar_energias_areas(areas: list[dict]) -> list[dict]:
    """Substitui placeholders zerados ou ausentes por medidores coerentes."""
    energias = []
    for area in areas:
        try:
            energias.append(int(float(area.get("energia"))))
        except (TypeError, ValueError):
            energias.append(None)

    usa_placeholder = bool(energias) and all(
        energia in {None, 0} for energia in energias
    )
    normalizadas = []
    for area, energia in zip(areas, energias):
        item = deepcopy(area)
        tendencia = str(item.get("tendencia", "estavel")).casefold().strip()
        if usa_placeholder or energia is None:
            energia = ENERGIA_POR_TENDENCIA.get(tendencia, 55)
        item["energia"] = max(0, min(100, energia))
        normalizadas.append(item)
    return normalizadas


def _normalizar_horoscopo_armazenado(item: dict) -> dict:
    """Compatibiliza ciclos salvos antes da validação dos percentuais."""
    normalizado = deepcopy(item)
    areas = normalizado.get("areas")
    if isinstance(areas, list):
        normalizado["areas"] = _normalizar_energias_areas(areas)
    return normalizado
