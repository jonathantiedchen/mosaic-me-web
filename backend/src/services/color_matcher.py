"""Color matching service using Delta E (CIE76) algorithm."""
import math
from typing import Tuple, List, Dict
import json
from pathlib import Path


def rgb_to_lab(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    """Convert RGB to LAB color space for perceptual color matching."""
    # Normalize RGB values to 0-1
    r, g, b = [x / 255.0 for x in rgb]

    # Apply gamma correction
    def gamma_correct(channel: float) -> float:
        if channel > 0.04045:
            return ((channel + 0.055) / 1.055) ** 2.4
        return channel / 12.92

    r = gamma_correct(r)
    g = gamma_correct(g)
    b = gamma_correct(b)

    # Convert to XYZ
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

    # Normalize for D65 illuminant
    x = x / 0.95047
    y = y / 1.00000
    z = z / 1.08883

    # Convert XYZ to LAB
    def f(t: float) -> float:
        if t > 0.008856:
            return t ** (1/3)
        return (7.787 * t) + (16/116)

    fx = f(x)
    fy = f(y)
    fz = f(z)

    l = (116 * fy) - 16
    a = 500 * (fx - fy)
    b_lab = 200 * (fy - fz)

    return (l, a, b_lab)


def delta_e_cie76(lab1: Tuple[float, float, float], lab2: Tuple[float, float, float]) -> float:
    """Calculate color difference using CIE76 Delta E formula."""
    l1, a1, b1 = lab1
    l2, a2, b2 = lab2

    return math.sqrt(
        (l2 - l1) ** 2 +
        (a2 - a1) ** 2 +
        (b2 - b1) ** 2
    )


class ColorMatcher:
    """Matches RGB colors to closest LEGO colors using perceptual color distance."""

    def __init__(self, palette_path: Path):
        """Initialize with a color palette."""
        with open(palette_path, 'r') as f:
            palette_data = json.load(f)

        self.palette_id = palette_data['id']
        self.palette_name = palette_data['name']
        self.colors = palette_data['colors']

        # Pre-compute LAB values for all palette colors
        self.lab_cache: Dict[str, Tuple[float, float, float]] = {}
        for color in self.colors:
            color_id = color['id']
            rgb = tuple(color['rgb'])
            self.lab_cache[color_id] = rgb_to_lab(rgb)

    def find_closest_color(self, rgb: Tuple[int, int, int]) -> Dict:
        """Find the closest LEGO color to the given RGB value."""
        target_lab = rgb_to_lab(rgb)

        min_distance = float('inf')
        closest_color = None

        for color in self.colors:
            color_id = color['id']
            color_lab = self.lab_cache[color_id]
            distance = delta_e_cie76(target_lab, color_lab)

            if distance < min_distance:
                min_distance = distance
                closest_color = color

        return closest_color

    def get_palette_info(self) -> Dict:
        """Get palette metadata."""
        return {
            'id': self.palette_id,
            'name': self.palette_name,
            'type': self.palette_id,
            'colorCount': len(self.colors)
        }

    def get_all_colors(self) -> List[Dict]:
        """Get all colors in the palette."""
        return self.colors
