from typing import Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str
    history: list[ChatMessage] = []


class SecurityInfo(BaseModel):
    flagged: bool
    action: str
    scan_type: str
    lakera_mode: str


class ChatResponse(BaseModel):
    reply: str
    active_model: str
    security: SecurityInfo
    meal_data: Optional[dict] = None
