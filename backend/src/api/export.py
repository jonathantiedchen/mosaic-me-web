"""Export API endpoint."""
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal, List, Dict
import logging

from ..services.export_service import ExportService
from ..services.mosaic_generator import MosaicGenerator
from ..services.analytics import analytics_service
from ..config import config
from ..db.database import get_db
from .upload import color_matchers, ALLOWED_BASEPLATE_SIZES

router = APIRouter()
export_service = ExportService()
logger = logging.getLogger(__name__)

# BrickLink part numbers for each piece type
BRICKLINK_PARTS = {'square': '3024', 'round': '4073'}  # Plate 1 x 1, Plate Round 1 x 1


class ExportRequest(BaseModel):
    """The current (possibly edited) mosaic, sent by the client."""
    sessionId: str = Field(..., max_length=64)
    pieceType: Literal['round', 'square']
    grid: List[List[str]] = Field(..., description="Rows of palette color ids")


def _build_grid(request: ExportRequest) -> List[List[Dict]]:
    """Rebuild full cell data from color ids using the server-side palette."""
    size = len(request.grid)
    if size not in ALLOWED_BASEPLATE_SIZES or any(len(row) != size for row in request.grid):
        raise HTTPException(
            status_code=400,
            detail={
                'code': 'INVALID_GRID',
                'message': 'Grid must be square with a supported baseplate size'
            }
        )

    color_matcher = color_matchers[request.pieceType]
    grid = []
    for row in request.grid:
        grid_row = []
        for color_id in row:
            color = color_matcher.get_color(color_id)
            if color is None:
                raise HTTPException(
                    status_code=400,
                    detail={
                        'code': 'INVALID_COLOR',
                        'message': f'Unknown color for {request.pieceType} pieces: {color_id[:64]}'
                    }
                )
            grid_row.append({
                'colorId': color['id'],
                'colorName': color['name'],
                'rgb': color['rgb'],
                'hex': color['hex'],
                'legoId': color.get('legoId')
            })
        grid.append(grid_row)
    return grid


@router.post('/export/{export_type}')
async def export_file(
    request: Request,
    export_type: Literal['mosaic-png', 'instructions-png', 'shopping-csv', 'pickabrick-csv', 'bricklink-xml'],
    body: ExportRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Export a mosaic file from the grid supplied by the client.

    The client sends the current grid (including any edits), so exports always
    match what the user sees and do not depend on server-side session state.
    """
    grid = _build_grid(body)
    shopping_list = MosaicGenerator(color_matchers[body.pieceType]).generate_shopping_list(grid)

    try:
        if export_type == 'mosaic-png':
            file_bytes = export_service.generate_mosaic_png(grid)
            media_type = "image/png"
        elif export_type == 'instructions-png':
            file_bytes = export_service.generate_instructions_png(grid, shopping_list)
            media_type = "image/png"
        elif export_type == 'shopping-csv':
            file_bytes = export_service.generate_shopping_csv(shopping_list, body.pieceType)
            media_type = "text/csv"
        elif export_type == 'pickabrick-csv':
            file_bytes = export_service.generate_pickabrick_csv(shopping_list)
            media_type = "text/csv"
        else:
            color_matcher = color_matchers[body.pieceType]
            bricklink_list = [
                {**item, 'bricklinkColorId': color_matcher.get_color(item['colorId']).get('bricklinkColorId')}
                for item in shopping_list
            ]
            file_bytes = export_service.generate_bricklink_xml(
                bricklink_list, BRICKLINK_PARTS[body.pieceType]
            )
            media_type = "application/xml"
    except Exception:
        logger.exception("Failed to generate %s export", export_type)
        raise HTTPException(
            status_code=500,
            detail={
                'code': 'EXPORT_FAILED',
                'message': 'Failed to generate export'
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
                session_id=body.sessionId,
                export_type=export_type
            )
        except Exception as e:
            # Log error but don't fail the request
            logger.error(f"Error tracking export download analytics: {e}")

    extension = {'image/png': 'png', 'text/csv': 'csv', 'application/xml': 'xml'}[media_type]
    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={
            'Content-Disposition': f'attachment; filename="{export_type}.{extension}"'
        }
    )
