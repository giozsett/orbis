"""Interpretações natais geradas uma vez e persistidas por mapa."""

import json

from agno.agent import Agent
from agno.run.base import RunStatus

from backend.app.database import db
from backend.models.interpretation import Interpretation
from backend.models.mapa_natal import MapaNatal
from backend.services.agno_openrouter_model import OpenRouterAgnoModel
from backend.services.modelo_config_service import obter_modelos


ELEMENTOS = {
    "Áries": "Fogo", "Leão": "Fogo", "Sagitário": "Fogo",
    "Touro": "Terra", "Virgem": "Terra", "Capricórnio": "Terra",
    "Gêmeos": "Ar", "Libra": "Ar", "Aquário": "Ar",
    "Câncer": "Água", "Escorpião": "Água", "Peixes": "Água",
}
DOMICILIOS = {
    "Sol": {"Leão"}, "Lua": {"Câncer"}, "Mercúrio": {"Gêmeos", "Virgem"},
    "Vênus": {"Touro", "Libra"}, "Marte": {"Áries", "Escorpião"},
    "Júpiter": {"Sagitário", "Peixes"}, "Saturno": {"Capricórnio", "Aquário"},
}
EXALTACOES = {
    "Sol": "Áries", "Lua": "Touro", "Mercúrio": "Virgem", "Vênus": "Peixes",
    "Marte": "Capricórnio", "Júpiter": "Câncer", "Saturno": "Libra",
}
CORES = {
    "Sol": "#ffb1c3", "Lua": "#deb7ff", "Mercúrio": "#eab9ce",
    "Vênus": "#ff4b89", "Marte": "#ffb4ab", "Júpiter": "#b86dfd",
    "Saturno": "#ac878f", "Urano": "#91cfff", "Netuno": "#8fd9d1",
    "Plutão": "#d9b8ff", "Nodo Norte": "#f4c2d7",
}


class InterpretacaoError(RuntimeError):
    pass


class MapaInterpretacaoNaoEncontrado(InterpretacaoError):
    pass


def obter_interpretacoes(usuario_id: int, *, forcar: bool = False) -> tuple[dict, bool]:
    mapa = (
        MapaNatal.query.filter_by(usuario_id=usuario_id, status="concluido")
        .order_by(MapaNatal.criado_em.asc(), MapaNatal.id.asc())
        .first()
    )
    if mapa is None:
        raise MapaInterpretacaoNaoEncontrado("Crie seu mapa principal antes das interpretações.")
    planetas = (mapa.dados or {}).get("planetas") or []
    existentes = mapa.interpretacoes.order_by(Interpretation.id.asc()).all()
    nomes_esperados = {item.get("nome") for item in planetas}
    if not forcar and len(existentes) == len(planetas) and {item.planeta for item in existentes} == nomes_esperados:
        return _resposta(mapa, existentes), True

    textos = _gerar_textos(mapa, planetas)
    try:
        mapa.interpretacoes.delete(synchronize_session=False)
        registros = []
        for planeta in planetas:
            nome = planeta.get("nome")
            registro = Interpretation(
                mapa_id=mapa.id,
                planeta=nome,
                signo=planeta.get("signo"),
                casa=planeta.get("casa"),
                grau=planeta.get("grau"),
                dignidade=_dignidade(nome, planeta.get("signo")),
                elemento=ELEMENTOS.get(planeta.get("signo")),
                estado="Retrógrado" if planeta.get("retrogrado") else "Direto",
                cor=CORES.get(nome, "#ffb1c3"),
                interpretacao=textos[nome],
            )
            db.session.add(registro)
            registros.append(registro)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    return _resposta(mapa, registros), False


def _gerar_textos(mapa: MapaNatal, planetas: list[dict]) -> dict[str, str]:
    modelos = obter_modelos("interpretacoes")
    contrato = {
        "interpretacoes": [
            {"planeta": item.get("nome"), "texto": "interpretação integrada em até 55 palavras"}
            for item in planetas
        ]
    }
    contexto = [
        {
            "nome": item.get("nome"), "signo": item.get("signo"),
            "casa": item.get("casa"), "posicao": item.get("posicao"),
            "retrogrado": item.get("retrogrado", False),
            "base": item.get("interpretacao_base"),
        }
        for item in planetas
    ]
    agente = Agent(
        name="Intérprete Natal ORBIS",
        model=OpenRouterAgnoModel(
            id=modelos[0], modelos_fallback=tuple(modelos[1:]),
            temperatura=0.45, max_tokens=2600, formato_json=True,
        ),
        description="Agente de interpretação do mapa natal principal.",
        instructions=[
            "Escreva em português do Brasil, com clareza, sobriedade e acolhimento.",
            "Integre função planetária, signo e casa sem inventar posições ou aspectos.",
            "Use linguagem simbólica de autoconhecimento, sem previsões deterministas.",
            "Cada texto deve ter no máximo 55 palavras e ser diferente dos demais.",
            "Responda somente com JSON válido e siga exatamente o contrato.",
        ],
        additional_context=(
            f"MAPA: {mapa.nome or 'Mapa principal'}\n"
            f"POSIÇÕES: {json.dumps(contexto, ensure_ascii=False)}\n"
            f"CONTRATO: {json.dumps(contrato, ensure_ascii=False)}"
        ),
        markdown=False,
        retries=0,
        telemetry=False,
    )
    execucao = agente.run("Gere as interpretações integradas deste mapa natal.")
    if execucao.status == RunStatus.error:
        raise InterpretacaoError(str(execucao.content or "Falha ao executar o agente."))
    return _validar_resposta(execucao.content, {item.get("nome") for item in planetas})


def _validar_resposta(conteudo, nomes: set[str]) -> dict[str, str]:
    texto = str(conteudo or "").strip()
    if texto.startswith("```"):
        texto = "\n".join(texto.splitlines()[1:-1]).strip()
    inicio, fim = texto.find("{"), texto.rfind("}")
    if inicio < 0 or fim <= inicio:
        raise InterpretacaoError("O agente não retornou um objeto JSON.")
    try:
        dados = json.loads(texto[inicio: fim + 1])
    except json.JSONDecodeError as erro:
        raise InterpretacaoError("O agente retornou JSON inválido.") from erro
    itens = dados.get("interpretacoes")
    if not isinstance(itens, list):
        raise InterpretacaoError("A lista de interpretações não foi retornada.")
    resultado = {}
    for item in itens:
        if not isinstance(item, dict):
            continue
        nome = str(item.get("planeta", "")).strip()
        interpretacao = str(item.get("texto", "")).strip()
        if nome in nomes and interpretacao:
            resultado[nome] = interpretacao
    faltantes = nomes - resultado.keys()
    if faltantes:
        raise InterpretacaoError(f"Faltaram interpretações para: {', '.join(sorted(faltantes))}.")
    return resultado


def _dignidade(planeta: str, signo: str) -> str:
    if signo in DOMICILIOS.get(planeta, set()):
        return "Domicílio"
    if EXALTACOES.get(planeta) == signo:
        return "Exaltação"
    return "Peregrino"


def _resposta(mapa: MapaNatal, registros: list[Interpretation]) -> dict:
    return {
        "mapa": {
            "id": mapa.id, "nome": mapa.nome or "Mapa principal",
            "local_nascimento": mapa.local_nascimento,
        },
        "interpretacoes": [
            {
                "id": item.id, "planeta": item.planeta, "signo": item.signo,
                "casa": item.casa, "grau": item.grau, "dignidade": item.dignidade,
                "elemento": item.elemento, "estado": item.estado, "cor": item.cor,
                "interpretacao": item.interpretacao,
            }
            for item in registros
        ],
    }
