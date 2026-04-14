import uuid
from datetime import date, datetime

from sqlalchemy import String, Float, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    difficulty: Mapped[str] = mapped_column(String(10))
    daily_calorie_target: Mapped[float] = mapped_column(Float)
    protein_target_g: Mapped[float] = mapped_column(Float)
    fat_target_g: Mapped[float] = mapped_column(Float)
    carbs_target_g: Mapped[float] = mapped_column(Float)
    fibre_target_g: Mapped[float] = mapped_column(Float, default=25.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="challenges")
    meal_plans = relationship("MealPlan", back_populates="challenge", cascade="all, delete-orphan")
    progress_entries = relationship("ProgressEntry", back_populates="challenge", cascade="all, delete-orphan")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("challenges.id"))
    day_number: Mapped[int] = mapped_column(Integer)
    breakfast: Mapped[dict] = mapped_column(JSONB)
    lunch: Mapped[dict] = mapped_column(JSONB)
    dinner: Mapped[dict] = mapped_column(JSONB)
    daily_summary: Mapped[dict] = mapped_column(JSONB)
    model_used: Mapped[str] = mapped_column(String(50))
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="meal_plans")


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("challenges.id"))
    entry_date: Mapped[date] = mapped_column(Date)
    actual_weight_kg: Mapped[float] = mapped_column(Float)
    calories_consumed: Mapped[float] = mapped_column(Float, default=0.0)
    meals_completed: Mapped[dict] = mapped_column(JSONB, default=dict)

    challenge = relationship("Challenge", back_populates="progress_entries")
