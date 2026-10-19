"""Database connection and session management."""
from typing import AsyncGenerator
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import logging
import uuid

from ..config import config

logger = logging.getLogger(__name__)

# Accept libpq-style URLs (e.g. from the Supabase-Vercel integration), whose
# query parameters asyncpg rejects: sslmode becomes asyncpg's ssl argument and
# the rest (such as supa=base-pooler.x) are dropped.
_url = make_url(config.DATABASE_URL)
_ssl = _url.query.get("sslmode")
database_url = _url.set(
    drivername="postgresql+asyncpg",
    # SQLAlchemy keeps its own prepared-statement cache on top of asyncpg's
    query={"prepared_statement_cache_size": "0"},
)

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
        **({"ssl": _ssl} if _ssl and _ssl != "disable" else {}),
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
            logger.info(f"Connected to database: {database_url.host}/{database_url.database}")
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
