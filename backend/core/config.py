import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediVault API"
    # Use SQLite by default for local dev if Postgres is not provided
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medivault.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-local-dev-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # External Services
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
