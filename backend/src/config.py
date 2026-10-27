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
    # Decoders Pillow may use, so uploaded bytes cannot pick another format
    ALLOWED_IMAGE_FORMATS = ("JPEG", "PNG", "WEBP")
    # A tiny file can declare enormous dimensions; reject those before decoding
    MAX_IMAGE_PIXELS = 50_000_000

    # Database
    # POSTGRES_URL is set by the Supabase-Vercel integration (transaction pooler)
    DATABASE_URL = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or "postgresql://postgres:postgres@localhost:5432/mosaicme"
    )

    # Session
    SESSION_TTL = 24 * 60 * 60  # 24 hours in seconds

    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 60))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", 3600))  # 1 hour

    # JWT Authentication (required: anyone who knows the key can sign admin tokens)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

    # Analytics
    ANALYTICS_ENABLED = os.getenv("ANALYTICS_ENABLED", "true").lower() == "true"
    ANALYTICS_SALT = os.getenv("ANALYTICS_SALT", "change-me-in-production-random-salt")

    # Initial Admin (for setup)
    INITIAL_ADMIN_EMAIL = os.getenv("INITIAL_ADMIN_EMAIL", "admin@example.com")
    INITIAL_ADMIN_PASSWORD = os.getenv("INITIAL_ADMIN_PASSWORD", "changeme123")

    # Paths
    BASE_DIR = Path(__file__).parent
    DATA_DIR = BASE_DIR / "data"
    PALETTES_DIR = DATA_DIR / "palettes"

config = Config()

# Placeholders that have shipped in this repository's code and docs
_PLACEHOLDER_JWT_SECRETS = {
    "dev-secret-key-change-in-production-min-32-chars",
    "your-secret-key-min-32-chars-change-in-production",
    "your-secret-key-here",
}

# Fail closed: never start signing admin tokens with a missing or public key
if len(config.JWT_SECRET_KEY) < 32 or config.JWT_SECRET_KEY in _PLACEHOLDER_JWT_SECRETS:
    raise RuntimeError(
        "JWT_SECRET_KEY must be set to a random value of at least 32 characters "
        "(generate one with: openssl rand -hex 32)"
    )
