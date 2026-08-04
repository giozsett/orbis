"""Catálogo versionado de modelos gratuitos usados pelo ORBIS."""

import json
from functools import lru_cache
from pathlib import Path


CAMINHO_MODELOS = Path(__file__).resolve().parents[1] / "data" / "modelos_openrouter.json"


class ModeloConfigError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def carregar_modelos() -> dict:
    with CAMINHO_MODELOS.open(encoding="utf-8") as arquivo:
        dados = json.load(arquivo)
    if not isinstance(dados, dict):
        raise ModeloConfigError("O catálogo de modelos possui formato inválido.")
    return dados


def obter_modelos(finalidade: str) -> list[str]:
    modelos = carregar_modelos().get(finalidade)
    if not isinstance(modelos, list) or not modelos:
        raise ModeloConfigError(
            f"Nenhum modelo foi configurado para a finalidade '{finalidade}'."
        )
    normalizados = [str(modelo).strip() for modelo in modelos if str(modelo).strip()]
    if not normalizados or any(
        not (modelo.endswith(":free") or modelo == "openrouter/free")
        for modelo in normalizados
    ):
        raise ModeloConfigError("O catálogo deve conter somente modelos gratuitos.")
    return list(dict.fromkeys(normalizados))
