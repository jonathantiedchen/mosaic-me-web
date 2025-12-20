"""Analytics API endpoints (admin-only)."""
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io
import logging

from ..db.database import get_db
from ..db.models import Admin
from ..services.analytics import analytics_service
from ..api.auth import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for responses

class AnalyticsMetrics(BaseModel):
    """Key analytics metrics."""
    unique_visitors: int
    mosaics_created: int
    downloads: Dict[str, int]
    period_days: int


class AnalyticsSummaryItem(BaseModel):
    """Single day analytics summary."""
    date: str
    unique_visitors: int
    mosaics_created: int
    mosaic_downloads: int
    instruction_downloads: int
    csv_downloads: int
    total_downloads: int


class PopularBaseplateSize(BaseModel):
    """Popular baseplate size."""
    baseplate_size: int
    count: int


# Analytics endpoints

@router.get("/analytics/metrics", response_model=AnalyticsMetrics)
async def get_key_metrics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get key analytics metrics for the dashboard.

    Requires admin authentication.

    Args:
        days: Number of days to analyze (1-365)
        admin: Current authenticated admin
        db: Database session

    Returns:
        Key metrics (visitors, mosaics, downloads)
    """
    try:
        # Get metrics from analytics service
        unique_visitors = await analytics_service.get_unique_visitors(db, days=days)
        mosaics_created = await analytics_service.get_mosaic_created_count(db, days=days)
        download_stats = await analytics_service.get_download_stats(db, days=days)

        logger.info(f"Admin {admin.email} retrieved analytics metrics for {days} days")

        return AnalyticsMetrics(
            unique_visitors=unique_visitors,
            mosaics_created=mosaics_created,
            downloads=download_stats,
            period_days=days
        )

    except Exception as e:
        logger.error(f"Error getting analytics metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics metrics"
        )


@router.get("/analytics/summary", response_model=List[AnalyticsSummaryItem])
async def get_analytics_summary(
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get daily analytics summary for a date range.

    Requires admin authentication.

    Args:
        start_date: Start date (default: 30 days ago)
        end_date: End date (default: today)
        admin: Current authenticated admin
        db: Database session

    Returns:
        List of daily analytics summaries
    """
    try:
        # Get summary from analytics service
        summary_data = await analytics_service.get_summary(
            db,
            start_date=start_date,
            end_date=end_date
        )

        logger.info(
            f"Admin {admin.email} retrieved analytics summary "
            f"from {start_date or 'default'} to {end_date or 'default'}"
        )

        return [AnalyticsSummaryItem(**item) for item in summary_data]

    except Exception as e:
        logger.error(f"Error getting analytics summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics summary"
        )


@router.get("/analytics/popular-sizes", response_model=List[PopularBaseplateSize])
async def get_popular_baseplate_sizes(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    limit: int = Query(5, ge=1, le=10, description="Maximum results"),
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get most popular baseplate sizes.

    Requires admin authentication.

    Args:
        days: Number of days to analyze (1-365)
        limit: Maximum number of results (1-10)
        admin: Current authenticated admin
        db: Database session

    Returns:
        List of popular baseplate sizes with counts
    """
    try:
        popular_sizes = await analytics_service.get_popular_baseplate_sizes(
            db,
            days=days,
            limit=limit
        )

        logger.info(f"Admin {admin.email} retrieved popular baseplate sizes")

        return [PopularBaseplateSize(**item) for item in popular_sizes]

    except Exception as e:
        logger.error(f"Error getting popular baseplate sizes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve popular baseplate sizes"
        )


@router.get("/analytics/export")
async def export_analytics_csv(
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Export analytics data as CSV file.

    Requires admin authentication.

    Args:
        start_date: Start date (default: 30 days ago)
        end_date: End date (default: today)
        admin: Current authenticated admin
        db: Database session

    Returns:
        CSV file download
    """
    try:
        # Get summary data
        summary_data = await analytics_service.get_summary(
            db,
            start_date=start_date,
            end_date=end_date
        )

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            "Date",
            "Unique Visitors",
            "Mosaics Created",
            "Mosaic Downloads",
            "Instruction Downloads",
            "CSV Downloads",
            "Total Downloads"
        ])

        # Write data rows
        for item in summary_data:
            writer.writerow([
                item["date"],
                item["unique_visitors"],
                item["mosaics_created"],
                item["mosaic_downloads"],
                item["instruction_downloads"],
                item["csv_downloads"],
                item["total_downloads"]
            ])

        # Convert to bytes
        output.seek(0)
        csv_data = output.getvalue()

        logger.info(f"Admin {admin.email} exported analytics CSV")

        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(csv_data.encode('utf-8')),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=analytics-{datetime.utcnow().strftime('%Y%m%d')}.csv"
            }
        )

    except Exception as e:
        logger.error(f"Error exporting analytics CSV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export analytics data"
        )


@router.post("/analytics/refresh")
async def refresh_analytics_view(
    admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually refresh the analytics summary materialized view.

    This is useful to get the latest data without waiting for the scheduled refresh.

    Requires admin authentication.

    Args:
        admin: Current authenticated admin
        db: Database session

    Returns:
        Success message
    """
    try:
        await analytics_service.refresh_summary_view(db)

        logger.info(f"Admin {admin.email} manually refreshed analytics view")

        return {
            "message": "Analytics summary view refreshed successfully",
            "refreshed_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error refreshing analytics view: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh analytics view"
        )
