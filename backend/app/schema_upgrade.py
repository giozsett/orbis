"""Atualizações aditivas para o SQLite do protótipo, sem remover dados."""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from flask import current_app
from sqlalchemy import inspect, text

from backend.app.database import db


COLUNAS_LOCALIZACAO = {
    "cidade_ibge": "VARCHAR(7)",
    "timezone_id": "VARCHAR(64)",
    "utc_offset_minutos": "INTEGER",
    "pais_codigo": "VARCHAR(2) DEFAULT 'BR'",
    "geoname_id": "VARCHAR(20)",
}


def aplicar_atualizacoes_aditivas() -> None:
    if db.engine.dialect.name != "sqlite":
        return

    inspetor = inspect(db.engine)
    tabelas = set(inspetor.get_table_names())
    if "mapas_natais" in tabelas:
        _atualizar_mapas_natais(inspetor)
    if "chat_mensagens" in tabelas and "chat_dias" in tabelas:
        _atualizar_historico_chat(inspetor)


def _atualizar_mapas_natais(inspetor) -> None:

    existentes = {coluna["name"] for coluna in inspetor.get_columns("mapas_natais")}
    with db.engine.begin() as conexao:
        for nome, tipo in COLUNAS_LOCALIZACAO.items():
            if nome not in existentes:
                conexao.execute(text(f"ALTER TABLE mapas_natais ADD COLUMN {nome} {tipo}"))
        conexao.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_mapas_natais_cidade_ibge "
            "ON mapas_natais (cidade_ibge)"
        ))
        conexao.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_mapas_natais_pais_codigo "
            "ON mapas_natais (pais_codigo)"
        ))
        conexao.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_mapas_natais_geoname_id "
            "ON mapas_natais (geoname_id)"
        ))


def _atualizar_historico_chat(inspetor) -> None:
    existentes = {coluna["name"] for coluna in inspetor.get_columns("chat_mensagens")}
    with db.engine.begin() as conexao:
        if "chat_dia_id" not in existentes:
            conexao.execute(text(
                "ALTER TABLE chat_mensagens ADD COLUMN chat_dia_id INTEGER "
                "REFERENCES chat_dias(id)"
            ))
        conexao.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_chat_mensagens_chat_dia_id "
            "ON chat_mensagens (chat_dia_id)"
        ))
    _vincular_mensagens_antigas()


def _vincular_mensagens_antigas() -> None:
    fuso = ZoneInfo(current_app.config.get("CHAT_TIMEZONE", "America/Sao_Paulo"))
    with db.engine.begin() as conexao:
        mensagens = conexao.execute(text(
            "SELECT id, usuario_id, mapa_id, papel, criado_em "
            "FROM chat_mensagens WHERE chat_dia_id IS NULL "
            "AND usuario_id IS NOT NULL AND mapa_id IS NOT NULL "
            "ORDER BY criado_em ASC, id ASC"
        )).mappings().all()
        grupos = {}
        for mensagem in mensagens:
            criado_em = mensagem["criado_em"]
            if isinstance(criado_em, str):
                criado_em = datetime.fromisoformat(criado_em)
            if criado_em.tzinfo is None:
                criado_em = criado_em.replace(tzinfo=timezone.utc)
            data_local = criado_em.astimezone(fuso).date()
            chave = (mensagem["usuario_id"], data_local)
            grupo = grupos.setdefault(chave, {
                "mapa_id": mensagem["mapa_id"], "ids": [], "perguntas": 0,
                "criado_em": criado_em, "atualizado_em": criado_em,
            })
            grupo["ids"].append(mensagem["id"])
            grupo["perguntas"] += mensagem["papel"] == "user"
            grupo["atualizado_em"] = criado_em

        for (usuario_id, data_local), grupo in grupos.items():
            data_parametro = data_local.isoformat()
            dia_id = conexao.execute(text(
                "SELECT id FROM chat_dias WHERE usuario_id = :usuario_id "
                "AND data_local = :data_local"
            ), {"usuario_id": usuario_id, "data_local": data_parametro}).scalar()
            if dia_id is None:
                resultado = conexao.execute(text(
                    "INSERT INTO chat_dias "
                    "(usuario_id, mapa_id, data_local, quantidade_perguntas, criado_em, atualizado_em) "
                    "VALUES (:usuario_id, :mapa_id, :data_local, :perguntas, :criado_em, :atualizado_em)"
                ), {"usuario_id": usuario_id, "mapa_id": grupo["mapa_id"],
                    "data_local": data_parametro, "perguntas": grupo["perguntas"],
                    "criado_em": _datetime_sqlite(grupo["criado_em"]),
                    "atualizado_em": _datetime_sqlite(grupo["atualizado_em"])})
                dia_id = resultado.lastrowid
            conexao.execute(text(
                "UPDATE chat_mensagens SET chat_dia_id = :dia_id "
                "WHERE id IN (" + ",".join(str(item) for item in grupo["ids"]) + ")"
            ), {"dia_id": dia_id})


def _datetime_sqlite(valor: datetime) -> str:
    if valor.tzinfo is not None:
        valor = valor.astimezone(timezone.utc).replace(tzinfo=None)
    return valor.isoformat(sep=" ")
