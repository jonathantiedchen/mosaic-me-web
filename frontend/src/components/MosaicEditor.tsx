import { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useMosaicEditor } from '../hooks/useMosaicEditor';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditableGrid } from './editor/EditableGrid';
import { ColorPalette } from './editor/ColorPalette';
import { recalculateShoppingList } from '../utils/gridUtils';
import { apiService } from '../services/api';
import type { MosaicGridCell, ShoppingListItem, LegoColor } from '../types';

interface MosaicEditorProps {
  grid: MosaicGridCell[][];
  shoppingList: ShoppingListItem[];
  pieceType: 'round' | 'square';
  onSave: (newGrid: MosaicGridCell[][], newShoppingList: ShoppingListItem[]) => void;
  onCancel: () => void;
}

export function MosaicEditor({ grid, shoppingList, pieceType, onSave, onCancel }: MosaicEditorProps) {
  const editor = useMosaicEditor();
  const [zoom, setZoom] = useState(0.75);
  const [availableColors, setAvailableColors] = useState<LegoColor[]>([]);

  // Fetch all available LEGO colors for the palette type
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const palette = await apiService.getPaletteColors(pieceType);
        setAvailableColors(palette.colors);
      } catch (error) {
        console.error('Failed to fetch palette colors:', error);
        // Fallback: extract colors from shopping list if API fails
        const colorMap = new Map<string, LegoColor>();
        shoppingList.forEach((item) => {
          colorMap.set(item.colorId, {
            id: item.colorId,
            name: item.colorName,
            rgb: item.rgb,
            hex: item.hex,
            pickABrickAvailable: true,
          });
        });
        setAvailableColors(Array.from(colorMap.values()));
      }
    };
    fetchColors();
  }, [pieceType, shoppingList]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  // Enter edit mode when component mounts
  useEffect(() => {
    editor.enterEditMode(grid);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      }

      // Ctrl+Y / Cmd+Shift+Z for redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        editor.redo();
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        editor.clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Handle cell interactions based on current tool
  const handleCellMouseDown = (row: number, col: number) => {
    if (editor.currentTool === 'brush') {
      editor.startPainting(row, col);
    }
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (editor.currentTool === 'brush') {
      editor.continuePainting(row, col);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (editor.currentTool === 'fill' && editor.editedGrid) {
      // For fill tool, select all connected pixels of the same color
      const originalColor = editor.editedGrid[row][col].colorId;
      const connectedCells = new Set<string>();
      const queue: [number, number][] = [[row, col]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const key = `${r}-${c}`;

        if (visited.has(key)) continue;
        if (r < 0 || r >= editor.editedGrid.length || c < 0 || c >= editor.editedGrid[0].length) continue;
        if (editor.editedGrid[r][c].colorId !== originalColor) continue;

        visited.add(key);
        connectedCells.add(key);

        queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
      }

      // Select all connected cells
      editor.startPainting(row, col);
      connectedCells.forEach(cellKey => {
        const [r, c] = cellKey.split('-').map(Number);
        editor.continuePainting(r, c);
      });
      editor.stopPainting();
    }
  };

  const handleColorSelect = (color: LegoColor) => {
    // Apply color to currently selected cells immediately
    if (editor.selectedCells.size > 0 && editor.editedGrid) {
      const newGrid = editor.editedGrid.map(row => [...row]);
      editor.selectedCells.forEach(cellKey => {
        const [row, col] = cellKey.split('-').map(Number);
        if (row >= 0 && row < newGrid.length && col >= 0 && col < newGrid[0].length) {
          newGrid[row][col] = {
            colorId: color.id,
            colorName: color.name,
            rgb: color.rgb,
            hex: color.hex,
          };
        }
      });

      // Update the grid through the editor's internal method
      // We'll need to expose a method to do this
      editor.applyColorToSelectedCells(newGrid);
    }
  };

  const handleSave = () => {
    if (!editor.editedGrid) return;

    const newShoppingList = recalculateShoppingList(editor.editedGrid);
    onSave(editor.editedGrid, newShoppingList);
    editor.exitEditMode();
  };

  const handleCancel = () => {
    editor.exitEditMode();
    onCancel();
  };

  if (!editor.editedGrid || availableColors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-purple-300">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <EditorToolbar
        currentTool={editor.currentTool}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onToolChange={editor.setCurrentTool}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onClearSelection={editor.clearSelection}
        onReset={editor.resetToOriginal}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Main editing area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Zoom controls */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-3">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-purple-200" />
          </button>
          <span className="text-xs font-bold text-white min-w-[60px] text-center px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-purple-200" />
          </button>
          {editor.selectedCells.size > 0 && (
            <div className="ml-4 text-sm text-purple-300">
              {editor.selectedCells.size} pixel{editor.selectedCells.size !== 1 ? 's' : ''} selected - click a color to apply
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Grid area (left, 70%) */}
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-start justify-center min-h-full">
              <EditableGrid
                grid={editor.editedGrid}
                selectedCells={editor.selectedCells}
                currentTool={editor.currentTool}
                zoom={zoom}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                onCellClick={handleCellClick}
                onMouseUp={editor.stopPainting}
                onMouseLeave={editor.stopPainting}
              />
            </div>
          </div>

          {/* Color palette (right, smaller sidebar) */}
          <div className="w-56 border-l border-white/10 bg-white/5 flex flex-col">
            <ColorPalette
              colors={availableColors}
              selectedColor={editor.selectedColor}
              onColorSelect={handleColorSelect}
            />
          </div>
        </div>

        {/* Note about preview */}
        <div className="px-6 py-3 bg-yellow-500/10 border-t border-yellow-500/20 text-xs text-yellow-200">
          Note: Changes apply to the instructions grid. The preview image shows the original generated mosaic.
        </div>
      </div>
    </div>
  );
}
