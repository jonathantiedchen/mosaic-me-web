"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .config import config
from .api import upload, export, palettes

# Create FastAPI app
app = FastAPI(
    title=config.APP_NAME,
    version=config.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print(f"Starting {config.APP_NAME} v{config.VERSION}")
    print(f"API available at: {config.API_V1_PREFIX}")
    print(f"Docs available at: /docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("Shutting down application")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )
