"""Mosaic generation service."""
from PIL import Image
import numpy as np
from typing import BinaryIO, Tuple, List, Dict
import uuid
from datetime import datetime

from .color_matcher import ColorMatcher
from ..config import config


class MosaicGenerator:
    """Generates LEGO mosaics from images."""

    def __init__(self, color_matcher: ColorMatcher):
        """Initialize with a color matcher."""
        self.color_matcher = color_matcher

    def process_image(
        self,
        image: BinaryIO,
        baseplate_size: int
    ) -> Tuple[np.ndarray, List[List[Dict]]]:
        """
        Process an image and convert it to a mosaic grid.

        Args:
            image: The input image file
            baseplate_size: Target size (e.g., 48 for 48x48)

        Returns:
            Tuple of (processed image as numpy array, grid of color data)
        """
        # Open and process image
        img = Image.open(image, formats=config.ALLOWED_IMAGE_FORMATS)

        # Pillow only raises above twice MAX_IMAGE_PIXELS (and merely warns
        # below that), so enforce the cap here, before any pixels are decoded
        if img.width * img.height > config.MAX_IMAGE_PIXELS:
            raise Image.DecompressionBombError(
                f"Image has {img.width * img.height} pixels, more than {config.MAX_IMAGE_PIXELS}"
            )

        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Crop to square (center crop)
        width, height = img.size
        size = min(width, height)
        left = (width - size) // 2
        top = (height - size) // 2
        img = img.crop((left, top, left + size, top + size))

        # Resize to target grid size
        img = img.resize((baseplate_size, baseplate_size), Image.Resampling.LANCZOS)

        # Convert to numpy array
        img_array = np.array(img)

        # Generate color grid
        grid = []
        for row in img_array:
            grid_row = []
            for pixel in row:
                rgb = tuple(pixel)
                closest_color = self.color_matcher.find_closest_color(rgb)
                grid_row.append({
                    'colorId': closest_color['id'],
                    'colorName': closest_color['name'],
                    'rgb': closest_color['rgb'],
                    'hex': closest_color['hex'],
                    'legoId': closest_color.get('legoId')
                })
            grid.append(grid_row)

        return img_array, grid

    def generate_shopping_list(self, grid: List[List[Dict]]) -> List[Dict]:
        """Generate a shopping list from the mosaic grid."""
        color_counts = {}

        for row in grid:
            for cell in row:
                color_id = cell['colorId']
                if color_id not in color_counts:
                    color_counts[color_id] = {
                        'colorId': cell['colorId'],
                        'colorName': cell['colorName'],
                        'rgb': cell['rgb'],
                        'hex': cell['hex'],
                        'legoId': cell.get('legoId'),
                        'quantity': 0
                    }
                color_counts[color_id]['quantity'] += 1

        # Sort by quantity (descending)
        shopping_list = sorted(
            color_counts.values(),
            key=lambda x: x['quantity'],
            reverse=True
        )

        return shopping_list

    def create_mosaic_data(
        self,
        image: BinaryIO,
        baseplate_size: int,
        piece_type: str,
        preview_url: str
    ) -> Dict:
        """
        Create complete mosaic data structure.

        Args:
            image: The input image file
            baseplate_size: Size of the baseplate
            piece_type: Type of pieces ('round' or 'square')
            preview_url: URL to the preview image

        Returns:
            Complete mosaic data dictionary
        """
        # Generate mosaic
        img_array, grid = self.process_image(image, baseplate_size)
        shopping_list = self.generate_shopping_list(grid)

        # Calculate metadata
        total_pieces = baseplate_size * baseplate_size
        unique_colors = len(shopping_list)

        session_id = str(uuid.uuid4())

        mosaic_data = {
            'sessionId': session_id,
            'previewUrl': preview_url,
            'grid': grid,
            'shoppingList': shopping_list,
            'metadata': {
                'baseplateSize': baseplate_size,
                'pieceType': piece_type,
                'totalPieces': total_pieces,
                'uniqueColors': unique_colors,
                'createdAt': datetime.utcnow().isoformat() + 'Z'
            }
        }

        return mosaic_data
