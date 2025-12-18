"""Export API endpoint."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from typing import Literal

from ..services.export_service import ExportService
from .storage import get_mosaic_data

router = APIRouter()
export_service = ExportService()


@router.get('/export/{session_id}/{export_type}')
async def export_file(
    session_id: str,
    export_type: Literal['mosaic-png', 'instructions-png', 'shopping-csv']
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
