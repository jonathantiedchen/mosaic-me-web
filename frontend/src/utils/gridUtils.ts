import type { MosaicGridCell, ShoppingListItem, LegoColor } from '../types';

/**
 * Create a deep copy of the grid to ensure immutability
 */
export function deepCopyGrid(grid: MosaicGridCell[][]): MosaicGridCell[][] {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

/**
 * Recalculate shopping list from the current grid state
 */
export function recalculateShoppingList(grid: MosaicGridCell[][]): ShoppingListItem[] {
  const colorCounts = new Map<string, ShoppingListItem>();

  // Count occurrences of each color
  grid.flat().forEach(cell => {
    const existing = colorCounts.get(cell.colorId);
    if (existing) {
      existing.quantity++;
    } else {
      colorCounts.set(cell.colorId, {
        colorId: cell.colorId,
        colorName: cell.colorName,
        rgb: cell.rgb,
        hex: cell.hex,
        quantity: 1,
      });
    }
  });

  // Convert to array and sort by quantity (descending)
  return Array.from(colorCounts.values())
    .sort((a, b) => b.quantity - a.quantity);
}

/**
 * Flood fill algorithm using BFS
 * Fills all connected cells of the same color with a new color
 */
export function floodFill(
  grid: MosaicGridCell[][],
  startRow: number,
  startCol: number,
  newColor: LegoColor
): MosaicGridCell[][] {
  const originalColor = grid[startRow][startCol].colorId;

  // If clicking on a cell that's already the target color, do nothing
  if (originalColor === newColor.id) {
    return grid;
  }

  const newGrid = deepCopyGrid(grid);
  const queue: [number, number][] = [[startRow, startCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const key = `${row}-${col}`;

    // Skip if already visited or out of bounds
    if (visited.has(key)) continue;
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) continue;

    // Skip if this cell is not the original color
    if (grid[row][col].colorId !== originalColor) continue;

    // Mark as visited and update color
    visited.add(key);
    newGrid[row][col] = {
      colorId: newColor.id,
      colorName: newColor.name,
      rgb: newColor.rgb,
      hex: newColor.hex,
    };

    // Add adjacent cells (4-directional connectivity: up, down, left, right)
    queue.push(
      [row - 1, col], // up
      [row + 1, col], // down
      [row, col - 1], // left
      [row, col + 1]  // right
    );
  }

  return newGrid;
}

/**
 * Extract unique colors from shopping list and convert to LegoColor format
 */
export function extractColorsFromShoppingList(shoppingList: ShoppingListItem[]): LegoColor[] {
  return shoppingList.map(item => ({
    id: item.colorId,
    name: item.colorName,
    rgb: item.rgb,
    hex: item.hex,
    pickABrickAvailable: true, // Assume all colors in mosaic are available
  }));
}
