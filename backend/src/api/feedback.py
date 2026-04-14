"""Feedback API endpoints (public submission, admin-only retrieval)."""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from pydantic import BaseModel, Field, validator
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ..db.database import get_db
from ..db.models import Admin
from ..services.feedback import feedback_service
from .auth import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for requests/responses

class FeedbackSubmission(BaseModel):
    """User feedback submission."""
    session_id: str = Field(..., description="UUID of the mosaic session")
    feedback_type: str = Field(..., description="'thumbs_up' or 'thumbs_down'")
    comment: Optional[str] = Field(None, max_length=200, description="Optional comment (max 200 chars)")

    @validator('feedback_type')
    def validate_feedback_type(cls, v):
        if v not in ['thumbs_up', 'thumbs_down']:
            raise ValueError("feedback_type must be 'thumbs_up' or 'thumbs_down'")
        return v

    @validator('comment')
    def validate_comment(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) > 200:
                raise ValueError("Comment must be 200 characters or less")
            if len(v) == 0:
                return None  # Treat empty strings as None
        return v


class FeedbackResponse(BaseModel):
    """Feedback submission response."""
    success: bool
    feedback_id: Optional[int] = None
    message: str


class FeedbackStats(BaseModel):
    """Feedback statistics."""
    thumbs_up: int
    thumbs_down: int
    total: int
    satisfaction_rate: float
    period_days: int


class RecentFeedbackItem(BaseModel):
    """Single feedback item for admin view."""
    id: int
    session_id: str
    feedback_type: str
    comment: Optional[str]
    created_at: str


# Public endpoint (no authentication required)

@router.post("/feedback/submit", response_model=FeedbackResponse)
async def submit_feedback(
    request: Request,
    submission: FeedbackSubmission,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit user feedback for a mosaic session.

    This is a public endpoint - no authentication required.
    Uses visitor_hash from middleware for privacy-preserving tracking.

    Args:
        request: HTTP request (contains visitor_hash in state)
        submission: Feedback submission data
        db: Database session

    Returns:
        Success response with feedback ID
    """
    try:
        # Get visitor hash from middleware
        visitor_hash = getattr(request.state, 'visitor_hash', None)
        if not visitor_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visitor identification failed"
            )

        # Submit feedback
        result = await feedback_service.submit_feedback(
            db=db,
            session_id=submission.session_id,
            visitor_hash=visitor_hash,
            feedback_type=submission.feedback_type,
            comment=submission.comment
        )

        logger.info(
            f"Feedback submitted: {submission.feedback_type} for session {submission.session_id}"
        )

        return FeedbackResponse(
            success=result["success"],
            feedback_id=result.get("feedback_id"),
            message=result["message"]
        )

    except ValueError as e:
        # Business logic errors (duplicate submission, validation)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback"
        )


# Admin-only endpoints

@router.get("/feedback/stats", response_model=FeedbackStats)
async def get_feedback_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get feedback statistics for the admin dashboard.

    Requires admin authentication.

    Args:
        days: Number of days to analyze (1-365)
        admin: Current authenticated admin
        db: Database session

    Returns:
        Feedback statistics (thumbs up/down counts, satisfaction rate)
    """
    try:
        stats = await feedback_service.get_feedback_stats(db, days=days)

        logger.info(f"Admin {admin.email} retrieved feedback stats for {days} days")

        return FeedbackStats(
            thumbs_up=stats["thumbs_up"],
            thumbs_down=stats["thumbs_down"],
            total=stats["total"],
            satisfaction_rate=stats["satisfaction_rate"],
            period_days=days
        )

    except Exception as e:
        logger.error(f"Error getting feedback stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback statistics"
        )


@router.get("/feedback/recent", response_model=List[RecentFeedbackItem])
async def get_recent_feedback(
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
    comments_only: bool = Query(False, description="Only show feedback with comments"),
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent feedback submissions.

    Requires admin authentication.

    Args:
        limit: Maximum number of results (1-100)
        comments_only: If True, only return feedback with comments
        admin: Current authenticated admin
        db: Database session

    Returns:
        List of recent feedback items
    """
    try:
        feedback_items = await feedback_service.get_recent_feedback(
            db,
            limit=limit,
            include_comments_only=comments_only
        )

        logger.info(
            f"Admin {admin.email} retrieved {len(feedback_items)} recent feedback items"
        )

        return [RecentFeedbackItem(**item) for item in feedback_items]

    except Exception as e:
        logger.error(f"Error getting recent feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recent feedback"
        )
