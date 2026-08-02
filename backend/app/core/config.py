from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

    # General
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    APP_NAME: str = "VOID"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:5173"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://void_user:void_password@localhost:5432/void_db"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ROOT_USER: str = "void_minio_user"
    MINIO_ROOT_PASSWORD: str = "void_minio_password"
    MINIO_BUCKET_EMAILS: str = "void-emails"
    MINIO_BUCKET_SCREENSHOTS: str = "void-screenshots"
    MINIO_BUCKET_REPORTS: str = "void-reports"
    MINIO_BUCKET_ATTACHMENTS: str = "void-attachments"
    MINIO_USE_SSL: bool = False

    # Auth / JWT
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""

    # AI
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    DEFAULT_AI_PROVIDER: str = "openai"

    # Threat Intelligence
    VIRUSTOTAL_API_KEY: str = ""
    ABUSEIPDB_API_KEY: str = ""
    ALIENVAULT_OTX_API_KEY: str = ""
    HAVE_I_BEEN_PWNED_API_KEY: str = ""

    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100


settings = Settings()
