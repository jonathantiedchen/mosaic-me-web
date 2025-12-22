import type { MosaicGridCell } from '../types';

/**
 * Generate a preview image from grid data using HTML Canvas
 * Each cell is rendered as a colored square
 */
export function generatePreviewFromGrid(grid: MosaicGridCell[][]): string {
  const cellSize = 10; // Size of each cell in pixels
  const rows = grid.length;
  const cols = grid[0].length;

  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Render each cell
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      ctx.fillStyle = cell.hex;
      ctx.fillRect(
        colIndex * cellSize,
        rowIndex * cellSize,
        cellSize,
        cellSize
      );
    });
  });

  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
}
