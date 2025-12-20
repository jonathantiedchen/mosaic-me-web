"""SQLAlchemy ORM models for database tables."""
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
    Column,
    String,
    Integer,
    BigInteger,
    DateTime,
    ForeignKey,
    CheckConstraint,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .database import Base


class Admin(Base):
    """Admin user model for authentication."""

    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    refresh_tokens = relationship("RefreshToken", back_populates="admin", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Admin(id={self.id}, email={self.email}, is_active={self.is_active})>"

    def to_dict(self) -> dict:
        """Convert model to dictionary for API responses."""
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
        }


class RefreshToken(Base):
    """JWT refresh token model for token rotation."""

    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("admins.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    is_revoked = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    admin = relationship("Admin", back_populates="refresh_tokens")

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, admin_id={self.admin_id}, is_revoked={self.is_revoked})>"

    def revoke(self) -> None:
        """Revoke this refresh token."""
        self.is_revoked = True
        self.revoked_at = datetime.utcnow()

    def is_expired(self) -> bool:
        """Check if token is expired."""
        return datetime.utcnow() > self.expires_at

    def is_valid(self) -> bool:
        """Check if token is valid (not revoked and not expired)."""
        return not self.is_revoked and not self.is_expired()


class AnalyticsEvent(Base):
    """Analytics event model for privacy-focused tracking."""

    __tablename__ = "analytics_events"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    event_type = Column(String(50), nullable=False, index=True)
    session_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    visitor_hash = Column(String(64), nullable=True, index=True)
    baseplate_size = Column(Integer, nullable=True)
    piece_type = Column(String(20), nullable=True)
    export_type = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    event_metadata = Column('metadata', JSON, nullable=True)  # Use 'metadata' in DB, 'event_metadata' in model

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('page_view', 'mosaic_created', 'export_download')",
            name="chk_event_type"
        ),
    )

    def __repr__(self) -> str:
        return f"<AnalyticsEvent(id={self.id}, event_type={self.event_type}, created_at={self.created_at})>"

    def to_dict(self) -> dict:
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "event_type": self.event_type,
            "session_id": str(self.session_id) if self.session_id else None,
            "visitor_hash": self.visitor_hash,
            "baseplate_size": self.baseplate_size,
            "piece_type": self.piece_type,
            "export_type": self.export_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "metadata": self.event_metadata,
        }
