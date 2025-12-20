"""Authentication API endpoints."""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import logging

from ..config import config
from ..db.database import get_db
from ..db.models import Admin, RefreshToken
from ..services.auth import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# Initialize auth service
auth_service = AuthService(
    secret_key=config.JWT_SECRET_KEY,
    algorithm=config.JWT_ALGORITHM
)


# Pydantic models for request/response
class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Refresh token request model."""
    refresh_token: str


class AdminResponse(BaseModel):
    """Admin user response model."""
    id: str
    email: str
    full_name: Optional[str]
    is_active: bool


# Authentication endpoints

@router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate admin user and return JWT tokens.

    Args:
        credentials: Email and password
        db: Database session

    Returns:
        Access token and refresh token

    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Find admin by email
        result = await db.execute(
            select(Admin).where(Admin.email == credentials.email)
        )
        admin = result.scalar_one_or_none()

        # Verify admin exists and is active
        if not admin or not admin.is_active:
            logger.warning(f"Login attempt for non-existent or inactive admin: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not auth_service.verify_password(credentials.password, admin.password_hash):
            logger.warning(f"Failed login attempt for admin: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create tokens
        access_token = auth_service.create_access_token(
            data={"sub": str(admin.id), "email": admin.email},
            expires_delta=timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        refresh_token = auth_service.create_refresh_token(
            data={"sub": str(admin.id)},
            expires_delta=timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        # Store hashed refresh token in database
        token_hash = auth_service.hash_refresh_token(refresh_token)
        db_refresh_token = RefreshToken(
            admin_id=admin.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        db.add(db_refresh_token)

        # Update last login timestamp
        admin.last_login_at = datetime.utcnow()

        await db.commit()

        logger.info(f"Successful login for admin: {admin.email}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """
    Refresh access token using refresh token.

    Args:
        request: Refresh token request
        db: Database session

    Returns:
        New access token and refresh token

    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        # Verify refresh token
        payload = auth_service.verify_token(request.refresh_token, token_type="refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        admin_id = payload.get("sub")
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token payload"
            )

        # Verify refresh token exists in database and is valid
        token_hash = auth_service.hash_refresh_token(request.refresh_token)
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False
            )
        )
        db_refresh_token = result.scalar_one_or_none()

        if not db_refresh_token or not db_refresh_token.is_valid():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is invalid or expired"
            )

        # Get admin
        result = await db.execute(
            select(Admin).where(Admin.id == admin_id)
        )
        admin = result.scalar_one_or_none()

        if not admin or not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin account is invalid or inactive"
            )

        # Revoke old refresh token
        db_refresh_token.revoke()

        # Create new tokens
        access_token = auth_service.create_access_token(
            data={"sub": str(admin.id), "email": admin.email},
            expires_delta=timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        new_refresh_token = auth_service.create_refresh_token(
            data={"sub": str(admin.id)},
            expires_delta=timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        # Store new refresh token
        new_token_hash = auth_service.hash_refresh_token(new_refresh_token)
        new_db_refresh_token = RefreshToken(
            admin_id=admin.id,
            token_hash=new_token_hash,
            expires_at=datetime.utcnow() + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        db.add(new_db_refresh_token)

        await db.commit()

        logger.info(f"Token refreshed for admin: {admin.email}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during token refresh"
        )


@router.post("/auth/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout admin by revoking all refresh tokens.

    Args:
        credentials: Bearer token credentials
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If logout fails
    """
    try:
        # Verify access token
        token = credentials.credentials
        payload = auth_service.verify_token(token, token_type="access")

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )

        admin_id = payload.get("sub")

        # Revoke all active refresh tokens for this admin
        await db.execute(
            update(RefreshToken)
            .where(
                RefreshToken.admin_id == admin_id,
                RefreshToken.is_revoked == False
            )
            .values(is_revoked=True, revoked_at=datetime.utcnow())
        )

        await db.commit()

        logger.info(f"Logout for admin: {admin_id}")

        return {"message": "Successfully logged out"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during logout"
        )


# Dependency for protected routes

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Admin:
    """
    Dependency to get current authenticated admin from JWT token.

    Args:
        credentials: Bearer token credentials
        db: Database session

    Returns:
        Current admin user

    Raises:
        HTTPException: If authentication fails

    Usage:
        @app.get("/protected")
        async def protected_route(admin: Admin = Depends(get_current_admin)):
            return {"admin_email": admin.email}
    """
    try:
        # Verify access token
        token = credentials.credentials
        payload = auth_service.verify_token(token, token_type="access")

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        admin_id = payload.get("sub")
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get admin from database
        result = await db.execute(
            select(Admin).where(Admin.id == admin_id)
        )
        admin = result.scalar_one_or_none()

        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is inactive"
            )

        return admin

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/auth/me", response_model=AdminResponse)
async def get_current_admin_info(admin: Admin = Depends(get_current_admin)):
    """
    Get current authenticated admin information.

    Args:
        admin: Current admin (injected by dependency)

    Returns:
        Admin information
    """
    return AdminResponse(
        id=str(admin.id),
        email=admin.email,
        full_name=admin.full_name,
        is_active=admin.is_active
    )
