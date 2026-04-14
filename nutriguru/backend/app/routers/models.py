from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.security import ModelHealthResponse, ModelHealthEntry
from app.services.llm_router import check_all_model_health

router = APIRouter()


@router.get("/models/health", response_model=ModelHealthResponse)
async def model_health(user: dict = Depends(get_current_user)):
    health_data = await check_all_model_health()
    return health_data
