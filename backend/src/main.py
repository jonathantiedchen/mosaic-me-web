"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

from .config import config
from .api import upload, export, palettes, auth, analytics
from .db.database import init_db, close_db, SessionLocal
from .middleware.analytics import AnalyticsMiddleware
from .services.analytics import analytics_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=config.APP_NAME,
    version=config.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    description="Mosaic-Me API - Transform your photos into LEGO mosaic artwork"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Analytics middleware (if enabled)
if config.ANALYTICS_ENABLED:
    app.add_middleware(
        AnalyticsMiddleware,
        analytics_service=analytics_service,
        db_session_factory=SessionLocal,
        salt=config.ANALYTICS_SALT
    )
    logger.info("Analytics tracking enabled")


# Health check endpoint
@app.get(f"{config.API_V1_PREFIX}/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": config.VERSION
    }


# Include routers
app.include_router(upload.router, prefix=config.API_V1_PREFIX, tags=["upload"])
app.include_router(export.router, prefix=config.API_V1_PREFIX, tags=["export"])
app.include_router(palettes.router, prefix=config.API_V1_PREFIX, tags=["palettes"])
app.include_router(auth.router, prefix=config.API_V1_PREFIX, tags=["auth"])
app.include_router(analytics.router, prefix=config.API_V1_PREFIX, tags=["analytics"])


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info(f"Starting {config.APP_NAME} v{config.VERSION}")
    logger.info(f"API available at: {config.API_V1_PREFIX}")
    logger.info(f"API documentation available at: /docs")

    # Initialize database connection
    try:
        await init_db()
        logger.info("Database connection initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Application starting without database connection")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("Shutting down application")

    # Close database connections
    try:
        await close_db()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )
