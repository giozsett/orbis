from datetime import date, time

from pydantic import BaseModel, Field


class MapaNatalSchema(BaseModel):
    nome: str | None = Field(default=None, max_length=100)
    data_nascimento: date
    horario_nascimento: time
    local_nascimento: str = Field(min_length=1, max_length=255)
    cidade_ibge: str = Field(pattern=r"^\d{7}$")
