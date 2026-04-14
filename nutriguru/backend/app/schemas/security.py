from typing import Optional
from pydantic import BaseModel


class SecurityStatusResponse(BaseModel):
    mode: str
    total_scans_today: int
    threats_blocked_today: int
    false_positives_today: int
    avg_latency_ms: float


class SecurityModeUpdate(BaseModel):
    mode: str  # "enforce" | "graduated" | "monitor"
    reason: Optional[str] = None


class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    scan_type: str
    flagged: bool
    action_taken: str
    active_model: str
    breakdown: dict


class AuditLogResponse(BaseModel):
    entries: list[AuditLogEntry]
    total: int
    page: int
    page_size: int


class ModelHealthEntry(BaseModel):
    name: str
    provider: str
    status: str  # "healthy" | "degraded" | "down"
    latency_ms: Optional[float] = None


class ModelHealthResponse(BaseModel):
    models: list[ModelHealthEntry]
    active_model: str
