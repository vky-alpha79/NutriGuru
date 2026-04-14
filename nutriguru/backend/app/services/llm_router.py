import logging
from typing import Any

import httpx
import anthropic

from app.config import settings
from app.schemas.security import ModelHealthResponse, ModelHealthEntry

logger = logging.getLogger(__name__)


async def _call_nemotron(messages: list[dict]) -> str:
    payload: dict[str, Any] = {
        "model": "nemotron-cascade-2",
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": settings.llm_temperature,
            "num_predict": settings.llm_max_tokens,
        },
    }
    async with httpx.AsyncClient(timeout=settings.nemotron_timeout) as client:
        resp = await client.post(
            settings.ollama_cloud_endpoint,
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
    return data["message"]["content"]


async def _call_claude(messages: list[dict]) -> str:
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    system_text = ""
    api_messages: list[dict] = []
    for msg in messages:
        if msg["role"] == "system":
            system_text = msg["content"]
        else:
            api_messages.append({"role": msg["role"], "content": msg["content"]})

    resp = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=settings.llm_max_tokens,
        temperature=settings.llm_temperature,
        system=system_text,
        messages=api_messages,
    )
    return resp.content[0].text


async def _call_gemma(messages: list[dict]) -> str:
    payload: dict[str, Any] = {
        "model": "gemma4",
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": settings.llm_temperature,
            "num_predict": settings.llm_max_tokens,
        },
    }
    async with httpx.AsyncClient(timeout=settings.gemma_timeout) as client:
        resp = await client.post(
            f"{settings.ollama_local_endpoint}/api/chat",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
    return data["message"]["content"]


_CHAIN = [
    ("Nemotron", _call_nemotron),
    ("Claude", _call_claude),
    ("Gemma", _call_gemma),
]


async def route_llm_request(messages: list[dict]) -> tuple[str, str]:
    """Routes through Primary -> Fallback1 -> Fallback2. Returns (response_text, model_name)."""
    last_error: Exception | None = None
    for model_name, call_fn in _CHAIN:
        try:
            text = await call_fn(messages)
            return text, model_name
        except Exception as exc:
            last_error = exc
            logger.error("Model %s failed: %s", model_name, exc)
            continue

    raise RuntimeError(
        "All models in the fallback chain failed. "
        f"Last error: {last_error}"
    )


async def _probe_model(name: str, call_fn, timeout: int) -> ModelHealthEntry:
    """Lightweight health probe for a single model."""
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if name == "Nemotron":
                resp = await client.post(
                    settings.ollama_cloud_endpoint,
                    json={"model": "nemotron-cascade-2", "messages": [{"role": "user", "content": "ping"}], "stream": False},
                )
            elif name == "Claude":
                # For Claude, try a minimal messages.create; catch auth/network errors
                c = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
                await c.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=10,
                    messages=[{"role": "user", "content": "ping"}],
                )
                return ModelHealthEntry(name=name, provider="anthropic", status="healthy")
            else:
                resp = await client.post(
                    f"{settings.ollama_local_endpoint}/api/chat",
                    json={"model": "gemma4", "messages": [{"role": "user", "content": "ping"}], "stream": False},
                )

            if name != "Claude":
                if resp.status_code < 400:
                    return ModelHealthEntry(name=name, provider="ollama", status="healthy", latency_ms=resp.elapsed.total_seconds() * 1000)
                return ModelHealthEntry(name=name, provider="ollama", status="degraded")

    except Exception as exc:
        logger.warning("Health check failed for %s: %s", name, exc)

    provider = "anthropic" if name == "Claude" else "ollama"
    return ModelHealthEntry(name=name, provider=provider, status="down")


async def check_all_model_health() -> ModelHealthResponse:
    timeouts = {
        "Nemotron": settings.nemotron_timeout,
        "Claude": settings.claude_timeout,
        "Gemma": settings.gemma_timeout,
    }

    entries: list[ModelHealthEntry] = []
    active_model = "none"

    for model_name, call_fn in _CHAIN:
        entry = await _probe_model(model_name, call_fn, timeouts[model_name])
        entries.append(entry)
        if entry.status == "healthy" and active_model == "none":
            active_model = model_name

    return ModelHealthResponse(models=entries, active_model=active_model)
