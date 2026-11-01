"""Turning a shopping list into orders: spares, Pick-a-Brick limits and baseplates.

The frontend mirrors PICK_A_BRICK_MAX_PER_ELEMENT, SPARE_RATE and BASEPLATES in
frontend/src/utils/ordering.ts to show the same numbers; keep them in sync.
"""
import math
from typing import Dict, List

# Pick-a-Brick accepts at most this many of one element per order
PICK_A_BRICK_MAX_PER_ELEMENT = 999

# Optional extra plates, because 1x1 plates get lost
SPARE_RATE = 0.05

# How each mosaic size is laid out on standard LEGO baseplates. Pick-a-Brick does
# not sell baseplates; BrickLink sells them as parts 3811 (32x32) and 4186 (48x48).
BASEPLATES: Dict[int, Dict] = {
    32: {'studs': 32, 'count': 1, 'bricklinkPart': '3811'},
    48: {'studs': 48, 'count': 1, 'bricklinkPart': '4186'},
    64: {'studs': 32, 'count': 4, 'bricklinkPart': '3811'},
    96: {'studs': 48, 'count': 4, 'bricklinkPart': '4186'},
    128: {'studs': 32, 'count': 16, 'bricklinkPart': '3811'},
}
BASEPLATE_BRICKLINK_COLOR = 86  # Light Bluish Gray; the plates cover it completely
BASEPLATE_COLOR_NAME = 'Light Bluish Gray'


def with_spares(shopping_list: List[Dict]) -> List[Dict]:
    """Return a copy of the list with SPARE_RATE extra pieces per color (rounded up)."""
    return [{**item, 'quantity': math.ceil(item['quantity'] * (1 + SPARE_RATE))} for item in shopping_list]


def split_pickabrick_orders(shopping_list: List[Dict]) -> List[List[Dict]]:
    """Split a list into as few orders as possible with at most 999 of any element each."""
    largest = max((item['quantity'] for item in shopping_list), default=0)
    order_count = max(1, math.ceil(largest / PICK_A_BRICK_MAX_PER_ELEMENT))

    orders: List[List[Dict]] = [[] for _ in range(order_count)]
    for item in shopping_list:
        remaining = item['quantity']
        for order in orders:
            if remaining <= 0:
                break
            take = min(remaining, PICK_A_BRICK_MAX_PER_ELEMENT)
            order.append({**item, 'quantity': take})
            remaining -= take
    return orders


def baseplate_item(baseplate_size: int) -> Dict:
    """The baseplates needed for a mosaic of this size (in studs)."""
    layout = BASEPLATES[baseplate_size]
    studs = layout['studs']
    return {
        'name': f'Baseplate {studs}×{studs}',
        'count': layout['count'],
        'bricklinkPart': layout['bricklinkPart'],
        'bricklinkColorId': BASEPLATE_BRICKLINK_COLOR,
        'colorName': BASEPLATE_COLOR_NAME,
    }
