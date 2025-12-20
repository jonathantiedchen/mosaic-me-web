"""Analytics service for tracking and retrieving analytics data."""
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, text
import logging

from ..db.models import AnalyticsEvent

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for tracking and querying analytics events."""

    async def track_event(
        self,
        db: AsyncSession,
        event_type: str,
        visitor_hash: str,
        session_id: Optional[str] = None,
        baseplate_size: Optional[int] = None,
        piece_type: Optional[str] = None,
        export_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Track an analytics event.

        Args:
            db: Database session
            event_type: Type of event ('page_view', 'mosaic_created', 'export_download')
            visitor_hash: Hashed visitor identifier
            session_id: Optional session ID
            baseplate_size: Optional baseplate size (for mosaic_created)
            piece_type: Optional piece type (for mosaic_created)
            export_type: Optional export type (for export_download)
            metadata: Optional additional metadata
        """
        try:
            event = AnalyticsEvent(
                event_type=event_type,
                session_id=session_id,
                visitor_hash=visitor_hash,
                baseplate_size=baseplate_size,
                piece_type=piece_type,
                export_type=export_type,
                event_metadata=metadata
            )
            db.add(event)
            await db.commit()

            logger.debug(f"Tracked event: {event_type} for visitor: {visitor_hash[:8]}...")

        except Exception as e:
            logger.error(f"Error tracking event: {e}")
            await db.rollback()
            # Don't raise - analytics failures shouldn't break the main flow

    async def get_summary(
        self,
        db: AsyncSession,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get analytics summary for a date range.

        Args:
            db: Database session
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: today)

        Returns:
            List of daily analytics summaries
        """
        try:
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=30)
            if not end_date:
                end_date = datetime.utcnow()

            # Query analytics_summary materialized view
            query = text("""
                SELECT
                    date,
                    unique_visitors,
                    mosaics_created,
                    mosaic_downloads,
                    instruction_downloads,
                    csv_downloads,
                    total_downloads
                FROM analytics_summary
                WHERE date >= :start_date AND date <= :end_date
                ORDER BY date DESC
            """)

            result = await db.execute(
                query,
                {"start_date": start_date.date(), "end_date": end_date.date()}
            )

            rows = result.fetchall()

            return [
                {
                    "date": row.date.isoformat() if row.date else None,
                    "unique_visitors": row.unique_visitors or 0,
                    "mosaics_created": row.mosaics_created or 0,
                    "mosaic_downloads": row.mosaic_downloads or 0,
                    "instruction_downloads": row.instruction_downloads or 0,
                    "csv_downloads": row.csv_downloads or 0,
                    "total_downloads": row.total_downloads or 0,
                }
                for row in rows
            ]

        except Exception as e:
            logger.error(f"Error getting analytics summary: {e}")
            return []

    async def get_unique_visitors(
        self,
        db: AsyncSession,
        days: int = 30
    ) -> int:
        """
        Get count of unique visitors for the past N days.

        Args:
            db: Database session
            days: Number of days to look back (default: 30)

        Returns:
            Count of unique visitors
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            result = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.visitor_hash)))
                .where(
                    and_(
                        AnalyticsEvent.event_type == 'page_view',
                        AnalyticsEvent.created_at >= start_date
                    )
                )
            )

            count = result.scalar() or 0
            return count

        except Exception as e:
            logger.error(f"Error getting unique visitors: {e}")
            return 0

    async def get_mosaic_created_count(
        self,
        db: AsyncSession,
        days: int = 30
    ) -> int:
        """
        Get count of mosaics created for the past N days.

        Args:
            db: Database session
            days: Number of days to look back (default: 30)

        Returns:
            Count of mosaics created
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            result = await db.execute(
                select(func.count(AnalyticsEvent.id))
                .where(
                    and_(
                        AnalyticsEvent.event_type == 'mosaic_created',
                        AnalyticsEvent.created_at >= start_date
                    )
                )
            )

            count = result.scalar() or 0
            return count

        except Exception as e:
            logger.error(f"Error getting mosaic count: {e}")
            return 0

    async def get_download_stats(
        self,
        db: AsyncSession,
        days: int = 30
    ) -> Dict[str, int]:
        """
        Get download statistics by export type for the past N days.

        Args:
            db: Database session
            days: Number of days to look back (default: 30)

        Returns:
            Dictionary with download counts by type
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            # Query downloads by export type
            result = await db.execute(
                select(
                    AnalyticsEvent.export_type,
                    func.count(AnalyticsEvent.id).label('count')
                )
                .where(
                    and_(
                        AnalyticsEvent.event_type == 'export_download',
                        AnalyticsEvent.created_at >= start_date
                    )
                )
                .group_by(AnalyticsEvent.export_type)
            )

            rows = result.all()

            # Build download stats dictionary
            stats = {
                "mosaic_png": 0,
                "instructions_png": 0,
                "shopping_csv": 0,
                "total": 0
            }

            for row in rows:
                export_type = row.export_type
                count = row.count or 0

                if export_type == "mosaic-png":
                    stats["mosaic_png"] = count
                elif export_type == "instructions-png":
                    stats["instructions_png"] = count
                elif export_type == "shopping-csv":
                    stats["shopping_csv"] = count

                stats["total"] += count

            return stats

        except Exception as e:
            logger.error(f"Error getting download stats: {e}")
            return {
                "mosaic_png": 0,
                "instructions_png": 0,
                "shopping_csv": 0,
                "total": 0
            }

    async def get_popular_baseplate_sizes(
        self,
        db: AsyncSession,
        days: int = 30,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get most popular baseplate sizes.

        Args:
            db: Database session
            days: Number of days to look back (default: 30)
            limit: Maximum number of results (default: 5)

        Returns:
            List of baseplate sizes with counts
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            result = await db.execute(
                select(
                    AnalyticsEvent.baseplate_size,
                    func.count(AnalyticsEvent.id).label('count')
                )
                .where(
                    and_(
                        AnalyticsEvent.event_type == 'mosaic_created',
                        AnalyticsEvent.created_at >= start_date,
                        AnalyticsEvent.baseplate_size.isnot(None)
                    )
                )
                .group_by(AnalyticsEvent.baseplate_size)
                .order_by(func.count(AnalyticsEvent.id).desc())
                .limit(limit)
            )

            rows = result.all()

            return [
                {
                    "baseplate_size": row.baseplate_size,
                    "count": row.count or 0
                }
                for row in rows
            ]

        except Exception as e:
            logger.error(f"Error getting popular baseplate sizes: {e}")
            return []

    async def refresh_summary_view(self, db: AsyncSession) -> None:
        """
        Refresh the analytics_summary materialized view.

        This should be called periodically (e.g., via a cron job)
        to update the dashboard with recent data.

        Args:
            db: Database session
        """
        try:
            await db.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_summary"))
            await db.commit()
            logger.info("Analytics summary view refreshed successfully")

        except Exception as e:
            logger.error(f"Error refreshing analytics summary view: {e}")
            await db.rollback()


# Global instance
analytics_service = AnalyticsService()
