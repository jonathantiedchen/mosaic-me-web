"""Export API endpoint."""
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal
import logging

from ..services.export_service import ExportService
from ..services.analytics import analytics_service
from ..config import config
from ..db.database import get_db
from .storage import get_mosaic_data

router = APIRouter()
export_service = ExportService()
logger = logging.getLogger(__name__)


@router.get('/export/{session_id}/{export_type}')
async def export_file(
    request: Request,
    session_id: str,
    export_type: Literal['mosaic-png', 'instructions-png', 'shopping-csv'],
    db: AsyncSession = Depends(get_db)
):
    """
    Export a mosaic file.

    Args:
        session_id: Session ID of the mosaic
        export_type: Type of export (mosaic-png, instructions-png, shopping-csv)

    Returns:
        File download response
    """
    # Retrieve mosaic data
    mosaic_data = get_mosaic_data(session_id)

    if not mosaic_data:
        raise HTTPException(
            status_code=404,
            detail={
                'code': 'SESSION_NOT_FOUND',
                'message': 'Mosaic session not found or expired'
            }
        )

    try:
        if export_type == 'mosaic-png':
            # Generate mosaic PNG
            file_bytes = export_service.generate_mosaic_png(mosaic_data['grid'])
            filename = f"mosaic-{session_id}.png"
            media_type = "image/png"

        elif export_type == 'instructions-png':
            # Generate instructions PNG
            file_bytes = export_service.generate_instructions_png(
                mosaic_data['grid'],
                mosaic_data['shoppingList']
            )
            filename = f"instructions-{session_id}.png"
            media_type = "image/png"

        elif export_type == 'shopping-csv':
            # Generate shopping list CSV
            file_bytes = export_service.generate_shopping_csv(
                mosaic_data['shoppingList'],
                mosaic_data['metadata']['pieceType']
            )
            filename = f"shopping-list-{session_id}.csv"
            media_type = "text/csv"

        else:
            raise HTTPException(
                status_code=400,
                detail={
                    'code': 'INVALID_EXPORT_TYPE',
                    'message': 'Export type must be mosaic-png, instructions-png, or shopping-csv'
                }
            )

        # Track analytics event
        if config.ANALYTICS_ENABLED:
            try:
                visitor_hash = getattr(request.state, 'visitor_hash', 'unknown')
                await analytics_service.track_event(
                    db=db,
                    event_type="export_download",
                    visitor_hash=visitor_hash,
                    session_id=session_id,
                    export_type=export_type
                )
            except Exception as e:
                # Log error but don't fail the request
                logger.error(f"Error tracking export download analytics: {e}")

        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                'code': 'EXPORT_FAILED',
                'message': f'Failed to generate export: {str(e)}'
            }
        )
