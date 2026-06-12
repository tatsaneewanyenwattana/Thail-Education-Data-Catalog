# Module: Core
# Feature: Environment Variables ตาม #9

from pydantic_settings import BaseSettings, SettingsConfigDict

# CORS ตาม claude.md #49 — Frontend dev (Next.js)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3007",
    "http://localhost",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = ""
    APP_BASE_URL: str = "http://localhost:3000"

    DATABASE_URL: str = ""
    DATABASE_POOL_SIZE: int = 10

    REDIS_HOST: str = ""
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""

    MINIO_ENDPOINT: str = ""
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET_NAME: str = ""

    ELASTICSEARCH_URL: str = ""

    JWT_SECRET: str = ""
    JWT_EXPIRE_MINUTES: int = 60

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = ""
    SMTP_USE_TLS: bool = True

    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_REGISTER_PER_HOUR: int = 3
    RATE_LIMIT_LOGIN_PER_MINUTE: int = 5
    MAX_FILE_SIZE_MB: int = 100
    MAX_VERIFICATION_DOC_SIZE_MB: int = 5
    ALLOWED_ORIGINS: str = ""

    TURNSTILE_SECRET_KEY: str = ""
    TURNSTILE_ENABLED: bool = True

    @property
    def cors_allowed_origins(self) -> list[str]:
        if self.APP_ENV == "development":
            origins = list(ALLOWED_ORIGINS)
            if self.ALLOWED_ORIGINS.strip():
                for origin in self.ALLOWED_ORIGINS.split(","):
                    value = origin.strip()
                    if value and value not in origins:
                        origins.append(value)
            return origins
        if self.ALLOWED_ORIGINS.strip():
            origins = [
                origin.strip()
                for origin in self.ALLOWED_ORIGINS.split(",")
                if origin.strip()
            ]
            if self.is_production:
                origins = [origin for origin in origins if origin != "*"]
            return origins
        if self.APP_ENV == "staging":
            return list(ALLOWED_ORIGINS)
        return []

    @property
    def redis_url(self) -> str:
        if self.REDIS_PASSWORD:
            return (
                f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:"
                f"{self.REDIS_PORT}/0"
            )
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    @property
    def smtp_from_address(self) -> str:
        if self.SMTP_FROM_NAME and self.SMTP_FROM_EMAIL:
            return f"{self.SMTP_FROM_NAME} <{self.SMTP_FROM_EMAIL}>"
        if self.SMTP_FROM_EMAIL:
            return self.SMTP_FROM_EMAIL
        return self.SMTP_FROM

    @property
    def smtp_configured(self) -> bool:
        return bool(self.SMTP_HOST and self.smtp_from_address)

    @property
    def rate_limit_enabled(self) -> bool:
        return self.APP_ENV != "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def swagger_enabled(self) -> bool:
        return self.APP_ENV in ("development", "staging")


settings = Settings()
