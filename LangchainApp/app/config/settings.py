# config/settings.py

import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "InnoTopic_Website"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./test.db"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    class Config:
        env_file = ".env"

settings = Settings()
