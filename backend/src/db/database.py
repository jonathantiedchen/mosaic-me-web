"""Database connection and session management."""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import logging
import uuid

from ..config import config

logger = logging.getLogger(__name__)

# Convert postgresql:// to postgresql+asyncpg://
database_url = config.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
# SQLAlchemy keeps its own prepared-statement cache on top of asyncpg's
database_url += ("&" if "?" in database_url else "?") + "prepared_statement_cache_size=0"

# Serverless: each function instance is short-lived, so keep no pool of our own
# and let Supabase's pooler (transaction mode) share connections. That pooler
# cannot keep prepared statements, so asyncpg's statement caches must be off.
engine = create_async_engine(
    database_url,
    echo=False,  # Set to True for SQL query logging in development
    poolclass=NullPool,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
    },
)

# Create async session factory
SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for declarative models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI routes to get a database session.

    Usage:
        @app.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(MyModel))
            return result.scalars().all()
    """
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database connection pool on application startup.

    This function should be called in the FastAPI startup event.
    It verifies the database connection is working.
    """
    try:
        # Test the connection
        async with engine.begin() as conn:
            # You could run migrations here or verify tables exist
            logger.info("Database connection established successfully")
            logger.info(f"Connected to database: {database_url.split('@')[-1]}")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise


async def close_db() -> None:
    """
    Close database connection pool on application shutdown.

    This function should be called in the FastAPI shutdown event.
    """
    try:
        await engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")
        raise
