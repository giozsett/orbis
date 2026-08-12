from datetime import datetime, timezone

from backend.app.database import db


class ChatDia(db.Model):
    __tablename__ = "chat_dias"
    __table_args__ = (
        db.UniqueConstraint("usuario_id", "data_local", name="uq_chat_dias_usuario_data"),
    )

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False, index=True)
    mapa_id = db.Column(db.Integer, db.ForeignKey("mapas_natais.id"), nullable=False, index=True)
    data_local = db.Column(db.Date, nullable=False, index=True)
    quantidade_perguntas = db.Column(db.Integer, nullable=False, default=0)
    criado_em = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    atualizado_em = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    mensagens = db.relationship(
        "ChatMensagem",
        backref="dia",
        lazy="dynamic",
        order_by="ChatMensagem.id",
    )

    def __repr__(self) -> str:
        return f"<ChatDia {self.usuario_id} - {self.data_local}>"
