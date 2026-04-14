"""Feedback service for tracking and retrieving user feedback."""
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.exc import IntegrityError
import logging

from ..db.models import UserFeedback

logger = logging.getLogger(__name__)


class FeedbackService:
    """Service for tracking and querying user feedback."""

    async def submit_feedback(
        self,
        db: AsyncSession,
        session_id: str,
        visitor_hash: str,
        feedback_type: str,
        comment: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit user feedback for a mosaic session.

        Args:
            db: Database session
            session_id: UUID of the mosaic session
            visitor_hash: Hashed visitor identifier
            feedback_type: 'thumbs_up' or 'thumbs_down'
            comment: Optional user comment (max 200 chars)

        Returns:
            Dictionary with success status and feedback ID

        Raises:
            ValueError: If feedback already exists for this session/visitor
        """
        try:
            # Validate feedback type
            if feedback_type not in ['thumbs_up', 'thumbs_down']:
                raise ValueError("feedback_type must be 'thumbs_up' or 'thumbs_down'")

            # Validate comment length
            if comment and len(comment) > 200:
                raise ValueError("Comment must be 200 characters or less")

            # Create feedback record
            feedback = UserFeedback(
                session_id=session_id,
                visitor_hash=visitor_hash,
                feedback_type=feedback_type,
                comment=comment.strip() if comment else None
            )

            db.add(feedback)
            await db.commit()
            await db.refresh(feedback)

            logger.info(
                f"Feedback submitted: {feedback_type} for session {session_id} "
                f"by visitor {visitor_hash[:8]}..."
            )

            return {
                "success": True,
                "feedback_id": feedback.id,
                "message": "Feedback submitted successfully"
            }

        except IntegrityError as e:
            await db.rollback()
            # Unique constraint violation - feedback already exists
            logger.warning(
                f"Duplicate feedback attempt for session {session_id} "
                f"by visitor {visitor_hash[:8]}..."
            )
            raise ValueError("You have already submitted feedback for this mosaic")

        except Exception as e:
            await db.rollback()
            logger.error(f"Error submitting feedback: {e}")
            raise

    async def get_feedback_stats(
        self,
        db: AsyncSession,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get feedback statistics for the specified time period.

        Args:
            db: Database session
            days: Number of days to look back (default: 30)

        Returns:
            Dictionary with thumbs_up, thumbs_down, total counts and satisfaction_rate
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            # Query feedback counts by type
            result = await db.execute(
                select(
                    UserFeedback.feedback_type,
                    func.count(UserFeedback.id).label('count')
                )
                .where(UserFeedback.created_at >= start_date)
                .group_by(UserFeedback.feedback_type)
            )

            rows = result.all()

            # Build stats dictionary
            stats = {
                "thumbs_up": 0,
                "thumbs_down": 0,
                "total": 0,
                "satisfaction_rate": 0.0
            }

            for row in rows:
                count = row.count or 0
                if row.feedback_type == "thumbs_up":
                    stats["thumbs_up"] = count
                elif row.feedback_type == "thumbs_down":
                    stats["thumbs_down"] = count
                stats["total"] += count

            # Calculate satisfaction percentage
            if stats["total"] > 0:
                stats["satisfaction_rate"] = round(
                    (stats["thumbs_up"] / stats["total"]) * 100, 1
                )

            return stats

        except Exception as e:
            logger.error(f"Error getting feedback stats: {e}")
            return {
                "thumbs_up": 0,
                "thumbs_down": 0,
                "total": 0,
                "satisfaction_rate": 0.0
            }

    async def get_recent_feedback(
        self,
        db: AsyncSession,
        limit: int = 20,
        include_comments_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get recent feedback submissions.

        Args:
            db: Database session
            limit: Maximum number of results (default: 20)
            include_comments_only: If True, only return feedback with comments

        Returns:
            List of recent feedback items
        """
        try:
            query = select(UserFeedback).order_by(desc(UserFeedback.created_at))

            if include_comments_only:
                query = query.where(UserFeedback.comment.isnot(None))

            query = query.limit(limit)

            result = await db.execute(query)
            feedback_items = result.scalars().all()

            return [
                {
                    "id": item.id,
                    "session_id": str(item.session_id),
                    "feedback_type": item.feedback_type,
                    "comment": item.comment,
                    "created_at": item.created_at.isoformat(),
                    # Don't expose visitor_hash to avoid privacy concerns
                }
                for item in feedback_items
            ]

        except Exception as e:
            logger.error(f"Error getting recent feedback: {e}")
            return []

    async def check_feedback_exists(
        self,
        db: AsyncSession,
        session_id: str,
        visitor_hash: str
    ) -> bool:
        """
        Check if feedback already exists for a session/visitor combination.

        Args:
            db: Database session
            session_id: UUID of the mosaic session
            visitor_hash: Hashed visitor identifier

        Returns:
            True if feedback exists, False otherwise
        """
        try:
            result = await db.execute(
                select(func.count(UserFeedback.id))
                .where(
                    and_(
                        UserFeedback.session_id == session_id,
                        UserFeedback.visitor_hash == visitor_hash
                    )
                )
            )
            count = result.scalar() or 0
            return count > 0

        except Exception as e:
            logger.error(f"Error checking feedback existence: {e}")
            return False


# Global instance
feedback_service = FeedbackService()
