from datetime import datetime, timezone

from backend.app.database import db


class Interpretation(db.Model):
    __tablename__ = "interpretacoes"

    id = db.Column(db.Integer, primary_key=True)
    mapa_id = db.Column(db.Integer, db.ForeignKey("mapas_natais.id"), nullable=False)
    planeta = db.Column(db.String(50), nullable=False)
    signo = db.Column(db.String(20), nullable=False)
    casa = db.Column(db.Integer, nullable=True)
    interpretacao = db.Column(db.Text, nullable=False)
    criado_em = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Interpretation {self.planeta} em {self.signo}>"
