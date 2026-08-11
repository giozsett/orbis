"""Cliente HTTP centralizado para modelos servidos pelo OpenRouter."""

from typing import Any

import httpx
from flask import current_app


class OpenRouterError(RuntimeError):
    """Erro base ao conversar com o OpenRouter."""


class OpenRouterConfigurationError(OpenRouterError):
    """Configuração obrigatória ausente ou inválida."""


class OpenRouterResponseError(OpenRouterError):
    """Resposta inválida ou erro retornado pelo provedor."""


def completar(
    mensagens: list[dict[str, str]],
    modelo: str,
    *,
    modelos_fallback: list[str] | tuple[str, ...] | None = None,
    temperatura: float = 0.55,
    max_tokens: int = 1200,
    formato_json: bool = False,
) -> str:
    """Envia uma conversa ao OpenRouter e devolve apenas o texto gerado."""

    api_key = str(current_app.config.get("OPENROUTER_API_KEY", "")).strip()
    if not api_key or api_key.startswith("cole-"):
        raise OpenRouterConfigurationError(
            "Defina OPENROUTER_API_KEY no arquivo .env."
        )

    modelo = str(modelo or "").strip()
    if not modelo:
        raise OpenRouterConfigurationError(
            "Nenhum modelo foi definido no catálogo backend/data/modelos_openrouter.json."
        )

    base_url = str(current_app.config["OPENROUTER_BASE_URL"]).rstrip("/")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-Title": str(current_app.config.get("OPENROUTER_APP_NAME", "ORBIS")),
    }
    app_url = str(current_app.config.get("OPENROUTER_APP_URL", "")).strip()
    if app_url:
        headers["HTTP-Referer"] = app_url

    modelos = list(dict.fromkeys([
        modelo,
        *(modelos_fallback or []),
    ]))[:3]
    payload: dict[str, Any] = {
        "messages": mensagens,
        "temperature": temperatura,
        "max_tokens": max_tokens,
    }
    if len(modelos) > 1:
        payload["models"] = modelos
    else:
        payload["model"] = modelo
    if formato_json:
        payload["response_format"] = {"type": "json_object"}
        payload["reasoning"] = {
            "exclude": True,
        }

    timeout = float(current_app.config.get("OPENROUTER_TIMEOUT_SECONDS", 30))
    try:
        with httpx.Client(timeout=timeout) as cliente:
            resposta = cliente.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
    except httpx.TimeoutException as erro:
        raise OpenRouterResponseError(
            "O modelo demorou mais que o limite configurado para responder."
        ) from erro
    except httpx.HTTPError as erro:
        raise OpenRouterResponseError(
            "Não foi possível conectar ao OpenRouter."
        ) from erro

    if resposta.is_error:
        mensagem = _mensagem_erro(resposta)
        raise OpenRouterResponseError(
            f"OpenRouter respondeu com status {resposta.status_code}: {mensagem}"
        )

    try:
        conteudo = resposta.json()["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as erro:
        raise OpenRouterResponseError(
            "O OpenRouter retornou uma resposta sem conteúdo utilizável."
        ) from erro

    if isinstance(conteudo, list):
        conteudo = "".join(
            parte.get("text", "")
            for parte in conteudo
            if isinstance(parte, dict)
        )
    conteudo = str(conteudo or "").strip()
    if not conteudo:
        raise OpenRouterResponseError("O modelo retornou uma resposta vazia.")
    return conteudo


def _mensagem_erro(resposta: httpx.Response) -> str:
    try:
        dados = resposta.json()
        erro = dados.get("error", {})
        return str(erro.get("message") or dados.get("message") or "erro desconhecido")
    except (ValueError, AttributeError):
        return "erro desconhecido"
