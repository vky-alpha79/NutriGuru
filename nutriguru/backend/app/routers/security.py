from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.schemas.security import (
    SecurityStatusResponse,
    SecurityModeUpdate,
    AuditLogEntry,
    AuditLogResponse,
)
from app.services.lakera_guard import get_current_mode, set_mode
from app.models.audit import AuditEvent
from app.config import LakeraMode

from datetime import datetime, date

router = APIRouter()


@router.get("/security/status", response_model=SecurityStatusResponse)
async def security_status(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    mode = await get_current_mode()
    today_start = datetime.combine(date.today(), datetime.min.time())

    total = await db.scalar(
        select(func.count(AuditEvent.id)).where(AuditEvent.created_at >= today_start)
    )
    blocked = await db.scalar(
        select(func.count(AuditEvent.id)).where(
            AuditEvent.created_at >= today_start, AuditEvent.flagged == True
        )
    )

    return SecurityStatusResponse(
        mode=mode.value,
        total_scans_today=total or 0,
        threats_blocked_today=blocked or 0,
        false_positives_today=0,
        avg_latency_ms=45.0,
    )


@router.put("/security/mode")
async def update_mode(
    body: SecurityModeUpdate,
    user: dict = Depends(require_admin),
):
    new_mode = LakeraMode(body.mode)
    await set_mode(new_mode)
    return {"mode": new_mode.value, "updated_by": user["sub"]}


@router.get("/security/logs", response_model=AuditLogResponse)
async def get_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size
    total = await db.scalar(select(func.count(AuditEvent.id)))

    result = await db.execute(
        select(AuditEvent)
        .order_by(AuditEvent.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    events = result.scalars().all()

    entries = [
        AuditLogEntry(
            id=str(e.id),
            timestamp=e.created_at.isoformat(),
            scan_type=e.scan_type,
            flagged=e.flagged,
            action_taken=e.action_taken,
            active_model=e.active_model,
            breakdown=e.breakdown,
        )
        for e in events
    ]
    return AuditLogResponse(entries=entries, total=total or 0, page=page, page_size=page_size)
