import type { ShoppingListItem } from '../types';

// Mirrors backend/src/services/ordering.py, which builds the actual files; keep in sync.
export const PICK_A_BRICK_MAX_PER_ELEMENT = 999;
export const SPARE_RATE = 0.05;

const BASEPLATES: Record<number, { studs: number; count: number }> = {
  32: { studs: 32, count: 1 },
  48: { studs: 48, count: 1 },
  64: { studs: 32, count: 4 },
  96: { studs: 48, count: 4 },
  128: { studs: 32, count: 16 },
};

/** LEGO Classic baseplate sets sold on lego.com, by size in studs. */
const LEGO_BASEPLATE_SETS: Record<number, string> = {
  32: '11026', // White Baseplate 32×32
  48: '11024', // Gray Baseplate 48×48
};

export interface BaseplateNeed {
  studs: number;
  count: number;
  legoSet: string;
}

export function baseplateNeed(baseplateSize: number): BaseplateNeed {
  const { studs, count } = BASEPLATES[baseplateSize];
  return { studs, count, legoSet: LEGO_BASEPLATE_SETS[studs] };
}

export function orderQuantity(quantity: number, spares: boolean): number {
  return spares ? Math.ceil(quantity * (1 + SPARE_RATE)) : quantity;
}

/** How many separate Pick-a-Brick orders the 999-per-element limit forces. */
export function pickABrickOrderCount(items: ShoppingListItem[], spares: boolean): number {
  const largest = Math.max(0, ...items.map((item) => orderQuantity(item.quantity, spares)));
  return Math.max(1, Math.ceil(largest / PICK_A_BRICK_MAX_PER_ELEMENT));
}
