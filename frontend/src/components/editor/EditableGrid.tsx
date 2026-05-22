import { memo } from 'react';
import type { MosaicGridCell, EditorTool } from '../../types';

interface EditableGridProps {
  grid: MosaicGridCell[][];
  selectedCells: Set<string>;
  currentTool: EditorTool;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onCellClick: (row: number, col: number) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  zoom?: number;
}

// Helper function to calculate brightness from RGB
function getBrightness(rgb: [number, number, number]): number {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
}

// Memoized grid cell component for performance
const GridCell = memo(({
  cell,
  row,
  col,
  isSelected,
  currentTool,
  cellSize,
  onMouseDown,
  onMouseEnter,
  onClick,
}: {
  cell: MosaicGridCell;
  row: number;
  col: number;
  isSelected: boolean;
  currentTool: EditorTool;
  cellSize: number;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onClick: (row: number, col: number) => void;
}) => {
  const textColor = getBrightness(cell.rgb) > 128 ? '#000' : '#fff';
  const cursorStyle = currentTool === 'brush' ? 'crosshair' : 'pointer';

  return (
    <div
      data-row={row}
      data-col={col}
      className={`
        relative flex items-center justify-center text-xs font-bold shadow-sm
        transition-all duration-75
        ${isSelected ? 'ring-2 ring-accent' : 'hover:ring-2 hover:ring-accent/60'}
      `}
      style={{
        backgroundColor: cell.hex,
        color: textColor,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        cursor: cursorStyle,
        fontSize: `${Math.max(8, cellSize * 0.6)}px`,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(row, col);
      }}
      onMouseEnter={() => onMouseEnter(row, col)}
      onClick={() => onClick(row, col)}
      title={cell.colorName}
    >
      {isSelected && (
        <div
          className="absolute inset-0 bg-accent/30 pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}
    </div>
  );
});

GridCell.displayName = 'GridCell';

export function EditableGrid({
  grid,
  selectedCells,
  currentTool,
  onCellMouseDown,
  onCellMouseEnter,
  onCellClick,
  onMouseUp,
  onMouseLeave,
  zoom = 1,
}: EditableGridProps) {
  if (!grid || grid.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        No grid data available
      </div>
    );
  }

  // Calculate cell size based on zoom (base size is 20px)
  const cellSize = 20 * zoom;

  return (
    <div
      className="inline-block"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{ userSelect: 'none' }}
    >
      <div
        className="grid gap-px bg-white/20 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCells.has(cellKey);

            return (
              <GridCell
                key={cellKey}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={isSelected}
                currentTool={currentTool}
                cellSize={cellSize}
                onMouseDown={onCellMouseDown}
                onMouseEnter={onCellMouseEnter}
                onClick={onCellClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
