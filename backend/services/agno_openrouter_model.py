"""Adaptador compartilhado entre agentes Agno e o cliente OpenRouter do ORBIS."""

import asyncio
from dataclasses import dataclass
from typing import Any, AsyncIterator, Callable, Iterator

from agno.models.base import Model
from agno.models.message import Message
from agno.models.response import ModelResponse

from backend.services.openrouter_service import completar


@dataclass
class OpenRouterAgnoModel(Model):
    id: str
    name: str = "OpenRouter via ORBIS"
    provider: str = "OpenRouter"
    temperatura: float = 0.45
    max_tokens: int = 420
    modelos_fallback: tuple[str, ...] = ()
    formato_json: bool = False
    cliente: Callable[..., str] | None = None

    def invoke(self, messages: list[Message], assistant_message: Message, **_kwargs) -> ModelResponse:
        assistant_message.metrics.start_timer()
        try:
            conteudo = (self.cliente or completar)(
                serializar_mensagens_agno(messages),
                self.id,
                modelos_fallback=self.modelos_fallback,
                temperatura=self.temperatura,
                max_tokens=self.max_tokens,
                formato_json=self.formato_json,
            )
        finally:
            assistant_message.metrics.stop_timer()
        return ModelResponse(content=conteudo)

    async def ainvoke(self, *args, **kwargs) -> ModelResponse:
        return await asyncio.to_thread(self.invoke, *args, **kwargs)

    def invoke_stream(self, *args, **kwargs) -> Iterator[ModelResponse]:
        yield self.invoke(*args, **kwargs)

    async def ainvoke_stream(self, *args, **kwargs) -> AsyncIterator[ModelResponse]:
        yield await self.ainvoke(*args, **kwargs)

    def _parse_provider_response(self, response: Any, **_kwargs) -> ModelResponse:
        return response if isinstance(response, ModelResponse) else ModelResponse(content=str(response))

    def _parse_provider_response_delta(self, response: Any) -> ModelResponse:
        return self._parse_provider_response(response)


def serializar_mensagens_agno(messages: list[Message]) -> list[dict[str, str]]:
    resultado = []
    for item in messages:
        papel = str(item.role or "user")
        if papel not in {"system", "user", "assistant"}:
            papel = "system" if papel == "developer" else "user"
        resultado.append({"role": papel, "content": str(item.content or "")})
    return resultado
