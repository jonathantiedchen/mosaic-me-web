"""Share links: save a mosaic's colors under a random id and open it again later."""
import base64
import logging
import re
import secrets
import uuid
from datetime import timedelta
from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.database import get_db
from ..db.models import SharedMosaic, utcnow
from ..services.mosaic_generator import MosaicGenerator
from .export import build_grid
from .upload import color_matchers

router = APIRouter()
logger = logging.getLogger(__name__)

# 9 random bytes -> 12 url-safe characters, 72 bits: not guessable
LINK_ID_BYTES = 9
LINK_ID_PATTERN = re.compile(r'^[A-Za-z0-9_-]{12}$')

# Flood guard without storing anything about who saved: caps new links site-wide
MAX_LINKS_PER_HOUR = 300


class SaveMosaicRequest(BaseModel):
    pieceType: Literal['round', 'square']
    grid: List[List[str]] = Field(..., description="Rows of palette color ids")


def _encode_cells(rows: List[List[str]]) -> tuple[List[str], str]:
    """One byte per stud, indexing into the list of colors the mosaic uses."""
    colors: List[str] = []
    index = {}
    cells = bytearray()
    for row in rows:
        for color_id in row:
            if color_id not in index:
                index[color_id] = len(colors)
                colors.append(color_id)
            cells.append(index[color_id])
    return colors, base64.b64encode(bytes(cells)).decode('ascii')


def _decode_cells(colors: List[str], cells: str, size: int) -> List[List[str]]:
    raw = base64.b64decode(cells)
    return [[colors[raw[r * size + c]] for c in range(size)] for r in range(size)]


@router.post('/mosaics')
async def save_mosaic(body: SaveMosaicRequest, db: AsyncSession = Depends(get_db)):
    """Save the mosaic's colors and return the id for its share link."""
    # Validates size and every color against the palette
    build_grid(body.pieceType, body.grid)

    recent = await db.scalar(
        select(func.count()).select_from(SharedMosaic)
        .where(SharedMosaic.created_at >= utcnow() - timedelta(hours=1))
    )
    if recent >= MAX_LINKS_PER_HOUR:
        raise HTTPException(
            status_code=429,
            detail={'code': 'TOO_MANY_LINKS', 'message': 'Too many links are being created right now. Please try again later.'}
        )

    colors, cells = _encode_cells(body.grid)
    mosaic = SharedMosaic(
        id=secrets.token_urlsafe(LINK_ID_BYTES),
        piece_type=body.pieceType,
        baseplate_size=len(body.grid),
        colors=colors,
        cells=cells,
    )
    db.add(mosaic)
    await db.commit()
    logger.info("Share link created for a %sx%s %s mosaic", mosaic.baseplate_size, mosaic.baseplate_size, mosaic.piece_type)

    return {'success': True, 'data': {'id': mosaic.id}}


@router.get('/mosaics/{link_id}')
async def open_mosaic(link_id: str, db: AsyncSession = Depends(get_db)):
    """Rebuild a saved mosaic. Each opening gets a fresh session id, like a new upload."""
    mosaic = await db.get(SharedMosaic, link_id) if LINK_ID_PATTERN.match(link_id) else None
    if mosaic is None:
        raise HTTPException(
            status_code=404,
            detail={'code': 'MOSAIC_NOT_FOUND', 'message': 'This mosaic link does not exist or has expired.'}
        )

    mosaic.last_opened_at = utcnow()
    await db.commit()

    grid = build_grid(mosaic.piece_type, _decode_cells(mosaic.colors, mosaic.cells, mosaic.baseplate_size))
    shopping_list = MosaicGenerator(color_matchers[mosaic.piece_type]).generate_shopping_list(grid)

    return {
        'success': True,
        'data': {
            'mosaic': {
                'sessionId': str(uuid.uuid4()),
                'grid': grid,
                'shoppingList': shopping_list,
                'metadata': {
                    'baseplateSize': mosaic.baseplate_size,
                    'pieceType': mosaic.piece_type,
                    'totalPieces': mosaic.baseplate_size ** 2,
                    'uniqueColors': len(shopping_list),
                    'createdAt': mosaic.created_at.isoformat(),
                },
            }
        }
    }
