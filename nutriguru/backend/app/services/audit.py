import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import async_session
from app.models.audit import AuditEvent

logger = logging.getLogger(__name__)


async def log_audit_event(
    user_id: str,
    session_id: str,
    scan_type: str,
    result: dict,
    action: str,
    mode: str,
    active_model: str = "",
    db: AsyncSession | None = None,
) -> None:
    """Persist one audit row. Uses the supplied session or creates a fresh one."""
    event = AuditEvent(
        id=uuid.uuid4(),
        user_id=uuid.UUID(user_id) if user_id else None,
        session_id=session_id,
        scan_type=scan_type,
        flagged=result.get("flagged", False),
        breakdown=result.get("breakdown", {}),
        action_taken=action,
        active_model=active_model,
        lakera_mode=mode,
        message_count=len(result.get("messages", [])),
    )

    if db is not None:
        db.add(event)
        await db.flush()
        return

    async with async_session() as session:
        session.add(event)
        await session.commit()
        logger.debug("Audit event %s persisted", event.id)
