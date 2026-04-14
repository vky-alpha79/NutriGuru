import logging
from datetime import datetime, timezone

import httpx

from app.config import settings, LakeraMode

logger = logging.getLogger(__name__)

_current_mode: LakeraMode = settings.lakera_default_mode


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def get_current_mode() -> LakeraMode:
    return _current_mode


async def set_mode(mode: LakeraMode) -> None:
    global _current_mode
    _current_mode = mode


async def _lakera_post(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{settings.lakera_region_url}/v2/guard",
            json=payload,
            headers={"Authorization": f"Bearer {settings.lakera_guard_api_key}"},
        )
        resp.raise_for_status()
        return resp.json()


def _base_metadata(**extra: str) -> dict:
    meta: dict = {
        "app": "nutriguru",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    meta.update(extra)
    return meta


# ---------------------------------------------------------------------------
# UC1 — Holistic Post-LLM Screening
# ---------------------------------------------------------------------------

async def screen_holistic(
    conversation_history: list[dict],
    llm_response: str,
    user_id: str,
    session_id: str,
    user_ip: str,
) -> dict:
    messages = conversation_history.copy()
    messages.append({"role": "assistant", "content": llm_response})

    payload = {
        "messages": messages,
        "project_id": settings.lakera_project_id,
        "breakdown": True,
        "metadata": _base_metadata(
            user_id=user_id,
            session_id=session_id,
            user_ip=user_ip,
        ),
    }
    return await _lakera_post(payload)


# ---------------------------------------------------------------------------
# UC2 — Additional Input Screening (Pre-LLM)
# ---------------------------------------------------------------------------

async def screen_input_only(
    conversation_history: list[dict],
    user_message: str,
    user_id: str,
    session_id: str,
) -> dict:
    messages = conversation_history.copy()
    messages.append({"role": "user", "content": user_message})

    payload = {
        "messages": messages,
        "project_id": settings.lakera_project_id,
        "breakdown": True,
        "metadata": _base_metadata(
            user_id=user_id,
            session_id=session_id,
            scan_type="input_pre_llm",
        ),
    }
    return await _lakera_post(payload)


# ---------------------------------------------------------------------------
# UC3 — RAG / Document Screening
# ---------------------------------------------------------------------------

async def screen_document_batch(document_content: str, doc_id: str) -> dict:
    payload = {
        "messages": [{"role": "user", "content": document_content}],
        "project_id": settings.lakera_project_id,
        "metadata": _base_metadata(
            doc_id=doc_id,
            scan_type="batch_document_ingestion",
        ),
    }
    return await _lakera_post(payload)


def build_rag_messages(
    system_prompt: str,
    reference_docs: list[str],
    user_question: str,
    assistant_response: str,
) -> list[dict]:
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    for doc in reference_docs:
        messages.append({"role": "user", "content": f"Context: {doc}"})
    messages.append({"role": "user", "content": user_question})
    messages.append({"role": "assistant", "content": assistant_response})
    return messages


# ---------------------------------------------------------------------------
# UC4 — Agent & Tool Call Screening
# ---------------------------------------------------------------------------

async def screen_agent_step(
    messages: list[dict],
    tool_name: str,
    tool_input: str,
    tool_output: str,
) -> dict:
    agent_messages = messages.copy()
    agent_messages.append({
        "role": "user",
        "content": f"[Tool: {tool_name}] Input: {tool_input}",
    })
    agent_messages.append({
        "role": "assistant",
        "content": f"[Tool Result]: {tool_output}",
    })

    payload = {
        "messages": agent_messages,
        "project_id": settings.lakera_project_id,
        "breakdown": True,
        "metadata": _base_metadata(
            tool_name=tool_name,
            scan_type="agent_tool_call",
        ),
    }
    return await _lakera_post(payload)


# ---------------------------------------------------------------------------
# UC5 — PII Detection & Data Leakage Prevention
# ---------------------------------------------------------------------------

async def handle_pii_detection(
    scan_result: dict,
    content: str,
    direction: str,
) -> str:
    """direction: 'input' (user->LLM) or 'output' (LLM->user)."""
    if not scan_result.get("flagged"):
        return content

    breakdown = scan_result.get("breakdown", {})
    pii_flagged = breakdown.get("pii", {}).get("flagged", False)

    if pii_flagged and direction == "input":
        logger.warning("PII detected in user input — masking before forwarding")
        return _mask_pii(content)

    if pii_flagged and direction == "output":
        logger.warning("PII detected in LLM output — blocking")
        return "I cannot include personal identifying information in responses."

    return content


def _mask_pii(text: str) -> str:
    """Best-effort PII masking — phone numbers, emails, Aadhaar patterns."""
    import re
    text = re.sub(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "[AADHAAR_MASKED]", text)
    text = re.sub(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b", "[EMAIL_MASKED]", text)
    text = re.sub(r"\b(?:\+91[\s-]?)?[6-9]\d{9}\b", "[PHONE_MASKED]", text)
    return text


# ---------------------------------------------------------------------------
# UC6 — Progressive Response Handling
# ---------------------------------------------------------------------------

async def progressive_response(scan_result: dict, context: str) -> dict:
    if not scan_result.get("flagged"):
        return {"action": "allow", "message": None}

    breakdown = scan_result.get("breakdown", {})

    high_confidence_detectors = ["prompt_injection", "jailbreak", "harmful_content"]
    if any(breakdown.get(d, {}).get("flagged") for d in high_confidence_detectors):
        logger.warning("HIGH threat detected — blocking")
        return {
            "action": "block",
            "message": "I can't process that request. Please ask me about your diet plan.",
            "show_threat_detail": False,
        }

    medium_confidence_detectors = ["off_topic", "policy_violation"]
    if any(breakdown.get(d, {}).get("flagged") for d in medium_confidence_detectors):
        return {
            "action": "warn",
            "message": "This seems outside my nutrition expertise. Continue anyway?",
            "allow_override": True,
        }

    logger.info("LOW confidence flag — allowing with review flag")
    return {"action": "allow", "message": None, "flagged_for_review": True}


# ---------------------------------------------------------------------------
# UC7 — Monitoring & Compliance Mode
# ---------------------------------------------------------------------------

async def screen_with_mode(payload: dict, mode: LakeraMode) -> dict:
    result = await _lakera_post(payload)

    if mode == LakeraMode.MONITOR_ONLY:
        logger.info("MONITOR_ONLY scan — flagged=%s", result.get("flagged"))
        return {"action": "allow", "monitoring_flagged": result.get("flagged", False)}

    if mode == LakeraMode.GRADUATED:
        if result.get("flagged") and _is_high_confidence(result):
            return await progressive_response(result, "high")
        return {"action": "allow"}

    # FULL_ENFORCE
    return await progressive_response(result, "full")


def _is_high_confidence(result: dict) -> bool:
    breakdown = result.get("breakdown", {})
    high = ["prompt_injection", "jailbreak", "harmful_content"]
    return any(breakdown.get(d, {}).get("flagged") for d in high)
