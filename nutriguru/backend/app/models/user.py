import uuid
from datetime import datetime

from sqlalchemy import String, Float, Integer, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50))
    age: Mapped[int] = mapped_column(Integer)
    sex: Mapped[str] = mapped_column(String(10))
    weight_kg: Mapped[float] = mapped_column(Float)
    height_cm: Mapped[float] = mapped_column(Float)
    bmi: Mapped[float] = mapped_column(Float)
    bmr: Mapped[float] = mapped_column(Float)
    tdee: Mapped[float] = mapped_column(Float)
    activity_type: Mapped[str] = mapped_column(String(20))
    dietary_pref: Mapped[str] = mapped_column(String(20))
    cuisine_pref: Mapped[str] = mapped_column(String(20))
    role: Mapped[str] = mapped_column(String(10), default="user")
    password_hash: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    challenges = relationship("Challenge", back_populates="user", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="user", cascade="all, delete-orphan")
