from datetime import datetime, timezone

from backend.app.database import db


class ChatMensagem(db.Model):
    __tablename__ = "chat_mensagens"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=True)
    mapa_id = db.Column(db.Integer, db.ForeignKey("mapas_natais.id"), nullable=True)
    mensagem = db.Column(db.Text, nullable=False)
    resposta = db.Column(db.Text, nullable=True)
    criado_em = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ChatMensagem {self.id}>"
