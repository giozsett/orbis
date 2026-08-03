from datetime import datetime, timezone

from backend.app.database import db


class MapaNatal(db.Model):
    __tablename__ = "mapas_natais"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    nome = db.Column(db.String(100), nullable=True)
    data_nascimento = db.Column(db.Date, nullable=False)
    horario_nascimento = db.Column(db.Time, nullable=False)
    local_nascimento = db.Column(db.String(200), nullable=False)
    cidade_ibge = db.Column(db.String(7), nullable=True, index=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    timezone_id = db.Column(db.String(64), nullable=True)
    utc_offset_minutos = db.Column(db.Integer, nullable=True)
    dados = db.Column(db.JSON, nullable=True)
    status = db.Column(
        db.String(20), nullable=False, default="pendente", index=True
    )
    horoscopo_dados = db.Column(db.JSON, nullable=True)
    criado_em = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    interpretacoes = db.relationship(
        "Interpretation", backref="mapa", lazy="dynamic"
    )
    mensagens = db.relationship("ChatMensagem", backref="mapa", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<MapaNatal {self.id} - {self.local_nascimento}>"
