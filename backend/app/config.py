import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartBank AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "smartbank_super_secret_jwt_key_hackathon_2026_demo_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo ease
    
    # SQLite default with PostgreSQL compatibility
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartbank.db")
    
    # Optional LLM
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Demo configuration
    DEMO_MODE: bool = True
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
