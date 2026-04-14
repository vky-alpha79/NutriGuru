from pydantic_settings import BaseSettings
from enum import Enum


class LakeraMode(str, Enum):
    MONITOR_ONLY = "monitor"
    GRADUATED = "graduated"
    FULL_ENFORCE = "enforce"


class AppEnv(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    # Model APIs
    anthropic_api_key: str = ""
    ollama_cloud_endpoint: str = ""
    ollama_local_endpoint: str = "http://localhost:11434"

    # Lakera
    lakera_guard_api_key: str = ""
    lakera_project_id: str = "project-1344722930"
    lakera_region: str = "ap-southeast-1"
    lakera_base_url: str = "https://api.lakera.ai/v2"

    # App
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/nutriguru"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/nutriguru"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    app_env: AppEnv = AppEnv.DEVELOPMENT

    # Defaults
    lakera_default_mode: LakeraMode = LakeraMode.FULL_ENFORCE
    secure_mode_default: bool = True

    # LLM shared params
    llm_temperature: float = 0.3
    llm_max_tokens: int = 4096
    llm_top_p: float = 0.9
    llm_stream: bool = False

    # Timeouts
    nemotron_timeout: int = 30
    claude_timeout: int = 20
    gemma_timeout: int = 15

    @property
    def lakera_region_url(self) -> str:
        return f"https://{self.lakera_region}.api.lakera.ai"

    @property
    def dev_info(self) -> bool:
        return self.app_env != AppEnv.PRODUCTION

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
