import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Logistics QR Tracking"
    API_V1_STR: str = "/api"
    # SQLite Database for dev/vercel
    DATABASE_URL: str = "sqlite:////tmp/logistics.db"
    
    # Auth (Stubbed for now, leaving space for Google OAuth)
    SECRET_KEY: str = "this-is-a-super-secret-key-for-dev-change-it"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Google OAuth settings (to be populated later)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # Uploads (Must be in /tmp on Vercel)
    UPLOAD_DIR: str = "/tmp/uploads"

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
