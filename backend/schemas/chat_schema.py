from pydantic import BaseModel, Field, field_validator


class ChatMensagemSchema(BaseModel):
    mensagem: str = Field(min_length=1, max_length=500)

    @field_validator("mensagem", mode="before")
    @classmethod
    def limpar_mensagem(cls, valor):
        return str(valor or "").strip()
