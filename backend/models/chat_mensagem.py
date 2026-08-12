from datetime import datetime, timezone

from backend.app.database import db


class ChatMensagem(db.Model):
    __tablename__ = "chat_mensagens"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=True)
    mapa_id = db.Column(db.Integer, db.ForeignKey("mapas_natais.id"), nullable=True)
    chat_dia_id = db.Column(db.Integer, db.ForeignKey("chat_dias.id"), nullable=True, index=True)
    papel = db.Column(
        db.String(10), nullable=False, default="user", index=True
    )
    mensagem = db.Column(db.Text, nullable=False)
    criado_em = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ChatMensagem {self.id}>"
