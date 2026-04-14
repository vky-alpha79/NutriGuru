from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import onboard, chat, plan, security, models, progress


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="NutriGuru API",
    description="Anti-Ageing Diet Recommender for India",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboard.router, prefix="/api/v1", tags=["onboard"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(plan.router, prefix="/api/v1", tags=["plan"])
app.include_router(security.router, prefix="/api/v1", tags=["security"])
app.include_router(models.router, prefix="/api/v1", tags=["models"])
app.include_router(progress.router, prefix="/api/v1", tags=["progress"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "nutriguru-api", "version": "2.0.0"}
