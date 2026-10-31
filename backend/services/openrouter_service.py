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


# Status que indicam problema da conta/chave: trocar de modelo não resolve.
STATUS_FATAIS = {401, 402, 403}


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
    ]))
    payload: dict[str, Any] = {
        "messages": mensagens,
        "temperature": temperatura,
        "max_tokens": max_tokens,
        # Os modelos gratuitos de raciocínio gastavam todo o max_tokens
        # "pensando" e devolviam conteúdo vazio. `exclude` só escondia esse
        # raciocínio; `enabled: False` impede que ele consuma o orçamento.
        "reasoning": {"enabled": False},
    }
    if formato_json:
        payload["response_format"] = {"type": "json_object"}

    # O fallback nativo do OpenRouter (`models`) só troca de modelo quando o
    # provedor dá erro; resposta vazia ou cortada passava direto. Por isso cada
    # modelo é tentado aqui, em ordem, até um devolver conteúdo utilizável.
    timeout = float(current_app.config.get("OPENROUTER_TIMEOUT_SECONDS", 30))
    falhas = []
    with httpx.Client(timeout=timeout) as cliente:
        for atual in modelos:
            try:
                return _tentar_modelo(
                    cliente, f"{base_url}/chat/completions", headers,
                    {**payload, "model": atual}, formato_json,
                )
            except OpenRouterConfigurationError:
                raise
            except OpenRouterResponseError as erro:
                current_app.logger.warning("OpenRouter: %s falhou: %s", atual, erro)
                falhas.append(f"{atual}: {erro}")

    raise OpenRouterResponseError(
        "Nenhum modelo gratuito respondeu. " + " | ".join(falhas)
    )


def _tentar_modelo(
    cliente: httpx.Client,
    url: str,
    headers: dict[str, str],
    payload: dict[str, Any],
    formato_json: bool,
) -> str:
    try:
        resposta = cliente.post(url, headers=headers, json=payload)
    except httpx.TimeoutException as erro:
        raise OpenRouterResponseError(
            "o modelo demorou mais que o limite configurado para responder"
        ) from erro
    except httpx.HTTPError as erro:
        raise OpenRouterResponseError(
            "não foi possível conectar ao OpenRouter"
        ) from erro

    if resposta.is_error:
        mensagem = f"status {resposta.status_code}: {_mensagem_erro(resposta)}"
        if resposta.status_code in STATUS_FATAIS:
            raise OpenRouterConfigurationError(f"OpenRouter recusou a chave ({mensagem}).")
        raise OpenRouterResponseError(mensagem)

    try:
        escolha = resposta.json()["choices"][0]
        conteudo = escolha["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as erro:
        raise OpenRouterResponseError(
            "resposta sem conteúdo utilizável"
        ) from erro

    if isinstance(conteudo, list):
        conteudo = "".join(
            parte.get("text", "")
            for parte in conteudo
            if isinstance(parte, dict)
        )
    conteudo = str(conteudo or "").strip()
    cortada = escolha.get("finish_reason") == "length"
    if not conteudo:
        raise OpenRouterResponseError(
            "resposta vazia (limite de tokens esgotado)" if cortada else "resposta vazia"
        )
    if cortada and formato_json:
        raise OpenRouterResponseError("JSON cortado pelo limite de tokens")
    return conteudo


def _mensagem_erro(resposta: httpx.Response) -> str:
    try:
        dados = resposta.json()
        erro = dados.get("error", {})
        return str(erro.get("message") or dados.get("message") or "erro desconhecido")
    except (ValueError, AttributeError):
        return "erro desconhecido"
