import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    session_id: Mapped[str] = mapped_column(String(100))
    scan_type: Mapped[str] = mapped_column(String(30))
    flagged: Mapped[bool] = mapped_column(Boolean)
    breakdown: Mapped[dict] = mapped_column(JSONB, default=dict)
    action_taken: Mapped[str] = mapped_column(String(20))
    active_model: Mapped[str] = mapped_column(String(50), default="")
    lakera_mode: Mapped[str] = mapped_column(String(20))
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_events")
