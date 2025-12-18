"""Color palettes API endpoint."""
from fastapi import APIRouter
import json
from pathlib import Path

from ..config import config

router = APIRouter()


@router.get('/palettes')
async def get_palettes():
    """
    Get available color palettes.

    Returns:
        List of available palettes with metadata
    """
    palettes = []

    for palette_file in config.PALETTES_DIR.glob('*.json'):
        with open(palette_file, 'r') as f:
            palette_data = json.load(f)

        palettes.append({
            'id': palette_data['id'],
            'name': palette_data['name'],
            'type': palette_data['type'],
            'colorCount': len(palette_data['colors'])
        })

    return {
        'success': True,
        'data': {
            'palettes': palettes
        }
    }


@router.get('/palettes/{palette_type}/colors')
async def get_palette_colors(palette_type: str):
    """
    Get detailed color information for a specific palette.

    Args:
        palette_type: Type of palette ('round' or 'square')

    Returns:
        Palette with all color details
    """
    palette_file = config.PALETTES_DIR / f"{palette_type}.json"

    if not palette_file.exists():
        return {
            'success': False,
            'error': {
                'code': 'PALETTE_NOT_FOUND',
                'message': f'Palette type "{palette_type}" not found'
            }
        }

    with open(palette_file, 'r') as f:
        palette_data = json.load(f)

    return {
        'success': True,
        'data': {
            'palette': palette_data
        }
    }
