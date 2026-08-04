from datetime import date, time

from pydantic import BaseModel, Field, field_validator, model_validator


class MapaNatalSchema(BaseModel):
    nome: str | None = Field(default=None, max_length=100)
    data_nascimento: date
    horario_nascimento: time
    local_nascimento: str = Field(min_length=1, max_length=255)
    pais_codigo: str = Field(default="BR", pattern=r"^[A-Za-z]{2}$")
    cidade_id: str | None = Field(default=None, pattern=r"^\d{1,20}$")
    cidade_ibge: str | None = Field(default=None, pattern=r"^\d{7}$")

    @field_validator("cidade_id", "cidade_ibge", mode="before")
    @classmethod
    def normalizar_identificador_vazio(cls, valor):
        return None if valor is None or str(valor).strip() == "" else str(valor).strip()

    @model_validator(mode="after")
    def validar_cidade(self):
        self.pais_codigo = self.pais_codigo.upper()
        if self.pais_codigo == "BR":
            self.cidade_id = self.cidade_id or self.cidade_ibge
        if not self.cidade_id:
            raise ValueError("Selecione uma cidade válida.")
        return self
