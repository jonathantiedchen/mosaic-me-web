import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Application
    APP_NAME = "Mosaic-Me API"
    VERSION = "1.0.0"
    API_V1_PREFIX = "/api/v1"

    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # File Upload
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    UPLOAD_DIR = Path("temp/uploads")
    EXPORT_DIR = Path("temp/exports")

    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/mosaicme"
    )

    # Session
    SESSION_TTL = 24 * 60 * 60  # 24 hours in seconds

    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 60))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", 3600))  # 1 hour

    # Paths
    BASE_DIR = Path(__file__).parent
    DATA_DIR = BASE_DIR / "data"
    PALETTES_DIR = DATA_DIR / "palettes"

config = Config()

# Ensure directories exist
config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
config.EXPORT_DIR.mkdir(parents=True, exist_ok=True)
