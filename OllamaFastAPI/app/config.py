from pydantic import BaseSettings

class Settings(BaseSettings):
    ollama_api_base_url: str
    fastapi_host: str
    fastapi_port: int
    default_model: str

    class Config:
        env_file = ".env"

settings = Settings()
