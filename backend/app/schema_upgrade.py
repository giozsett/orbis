"""Atualizações aditivas para o SQLite do protótipo, sem remover dados."""

from sqlalchemy import inspect, text

from backend.app.database import db


COLUNAS_LOCALIZACAO = {
    "cidade_ibge": "VARCHAR(7)",
    "timezone_id": "VARCHAR(64)",
    "utc_offset_minutos": "INTEGER",
}


def aplicar_atualizacoes_aditivas() -> None:
    if db.engine.dialect.name != "sqlite":
        return

    inspetor = inspect(db.engine)
    if "mapas_natais" not in inspetor.get_table_names():
        return

    existentes = {coluna["name"] for coluna in inspetor.get_columns("mapas_natais")}
    with db.engine.begin() as conexao:
        for nome, tipo in COLUNAS_LOCALIZACAO.items():
            if nome not in existentes:
                conexao.execute(text(f"ALTER TABLE mapas_natais ADD COLUMN {nome} {tipo}"))
        conexao.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_mapas_natais_cidade_ibge "
            "ON mapas_natais (cidade_ibge)"
        ))
