"""Upload and mosaic generation API endpoint."""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path
import base64
import uuid
from typing import Literal
import logging

from ..services.mosaic_generator import MosaicGenerator
from ..services.color_matcher import ColorMatcher
from ..services.analytics import analytics_service
from ..config import config
from ..db.database import get_db
from PIL import Image

router = APIRouter()
logger = logging.getLogger(__name__)

# Load color palettes
color_matchers = {}
for palette_file in config.PALETTES_DIR.glob('*.json'):
    palette_type = palette_file.stem
    color_matchers[palette_type] = ColorMatcher(palette_file)

ALLOWED_BASEPLATE_SIZES = (32, 48, 64, 96, 128)

# Reject decompression bombs: a tiny file can declare enormous dimensions
Image.MAX_IMAGE_PIXELS = 50_000_000


@router.post('/upload')
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    baseplateSize: int = Form(...),
    pieceType: Literal['round', 'square'] = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an image and generate a mosaic.

    Args:
        file: Image file (JPEG, PNG, WebP)
        baseplateSize: Size of the baseplate (32, 48, 64, 96, or 128)
        pieceType: Type of pieces ('round' or 'square')

    Returns:
        Generated mosaic data with session ID
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail={
                'code': 'INVALID_FILE_TYPE',
                'message': 'File must be an image (JPEG, PNG, or WebP)'
            }
        )

    # Validate file extension
    file_ext = Path(file.filename or '').suffix.lower().lstrip('.')
    if file_ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={
                'code': 'INVALID_FILE_TYPE',
                'message': f'Supported formats: {", ".join(config.ALLOWED_EXTENSIONS)}'
            }
        )

    # Validate baseplate size
    if baseplateSize not in ALLOWED_BASEPLATE_SIZES:
        raise HTTPException(
            status_code=400,
            detail={
                'code': 'INVALID_BASEPLATE_SIZE',
                'message': 'Baseplate size must be 32, 48, 64, 96, or 128'
            }
        )

    # Validate piece type
    if pieceType not in color_matchers:
        raise HTTPException(
            status_code=400,
            detail={
                'code': 'INVALID_PIECE_TYPE',
                'message': f'Piece type must be one of: {", ".join(color_matchers.keys())}'
            }
        )

    # Enforce the size limit server-side; never trust the client's check
    contents = await file.read(config.MAX_FILE_SIZE + 1)
    if len(contents) > config.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail={
                'code': 'FILE_TOO_LARGE',
                'message': f'File must be smaller than {config.MAX_FILE_SIZE // (1024 * 1024)}MB'
            }
        )

    # Random name: the client-supplied filename must not reach the filesystem
    temp_file = config.UPLOAD_DIR / f"upload_{uuid.uuid4().hex}.{file_ext}"

    try:
        temp_file.write_bytes(contents)

        # Generate mosaic
        color_matcher = color_matchers[pieceType]
        generator = MosaicGenerator(color_matcher)

        # Create preview URL placeholder (will be replaced with actual data)
        preview_url = ""

        # Generate mosaic data
        mosaic_data = generator.create_mosaic_data(
            temp_file,
            baseplateSize,
            pieceType,
            preview_url
        )

        # Generate preview image
        from ..services.export_service import ExportService
        export_service = ExportService()
        preview_bytes = export_service.generate_mosaic_png(mosaic_data['grid'])

        # Convert preview to base64 data URL
        preview_base64 = base64.b64encode(preview_bytes).decode('utf-8')
        preview_url = f"data:image/png;base64,{preview_base64}"
        mosaic_data['previewUrl'] = preview_url

        # Track analytics event
        if config.ANALYTICS_ENABLED:
            try:
                visitor_hash = getattr(request.state, 'visitor_hash', 'unknown')
                await analytics_service.track_event(
                    db=db,
                    event_type="mosaic_created",
                    visitor_hash=visitor_hash,
                    session_id=mosaic_data['sessionId'],
                    baseplate_size=baseplateSize,
                    piece_type=pieceType
                )
            except Exception as e:
                # Log error but don't fail the request
                logger.error(f"Error tracking mosaic creation analytics: {e}")

        return {
            'success': True,
            'data': {
                'sessionId': mosaic_data['sessionId'],
                'mosaic': mosaic_data
            }
        }

    except (Image.DecompressionBombError, Image.UnidentifiedImageError):
        raise HTTPException(
            status_code=400,
            detail={
                'code': 'INVALID_IMAGE',
                'message': 'The file could not be read as an image, or its dimensions are too large'
            }
        )
    except Exception:
        logger.exception("Mosaic generation failed")
        raise HTTPException(
            status_code=500,
            detail={
                'code': 'MOSAIC_GENERATION_FAILED',
                'message': 'Failed to generate mosaic'
            }
        )
    finally:
        temp_file.unlink(missing_ok=True)
