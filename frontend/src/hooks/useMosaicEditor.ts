import { useState, useCallback } from 'react';
import type { MosaicGridCell, LegoColor, EditorTool } from '../types';
import { deepCopyGrid, floodFill } from '../utils/gridUtils';

interface UseMosaicEditorReturn {
  isEditing: boolean;
  editedGrid: MosaicGridCell[][] | null;
  selectedColor: LegoColor | null;
  currentTool: EditorTool;
  selectedCells: Set<string>;
  isPainting: boolean;
  canUndo: boolean;
  canRedo: boolean;
  enterEditMode: (grid: MosaicGridCell[][]) => void;
  exitEditMode: () => void;
  setSelectedColor: (color: LegoColor) => void;
  setCurrentTool: (tool: EditorTool) => void;
  startPainting: (row: number, col: number) => void;
  continuePainting: (row: number, col: number) => void;
  stopPainting: () => void;
  clearSelection: () => void;
  applyFill: (row: number, col: number) => void;
  undo: () => void;
  redo: () => void;
  resetToOriginal: () => void;
  getEditedGrid: () => MosaicGridCell[][] | null;
  applyColorToSelectedCells: (newGrid: MosaicGridCell[][]) => void;
}

const MAX_HISTORY_SIZE = 50;

export function useMosaicEditor(): UseMosaicEditorReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGrid, setEditedGrid] = useState<MosaicGridCell[][] | null>(null);
  const [originalGrid, setOriginalGrid] = useState<MosaicGridCell[][] | null>(null);
  const [selectedColor, setSelectedColor] = useState<LegoColor | null>(null);
  const [currentTool, setCurrentTool] = useState<EditorTool>('brush');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isPainting, setIsPainting] = useState(false);

  // History management
  const [history, setHistory] = useState<MosaicGridCell[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  /**
   * Enter edit mode with a copy of the current grid
   */
  const enterEditMode = useCallback((grid: MosaicGridCell[][]) => {
    const gridCopy = deepCopyGrid(grid);
    setOriginalGrid(gridCopy);
    setEditedGrid(gridCopy);
    setHistory([gridCopy]);
    setHistoryIndex(0);
    setIsEditing(true);
    setSelectedCells(new Set());
    setCurrentTool('brush');
  }, []);

  /**
   * Exit edit mode and clear all state
   */
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    setEditedGrid(null);
    setOriginalGrid(null);
    setSelectedColor(null);
    setSelectedCells(new Set());
    setIsPainting(false);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  /**
   * Add current grid state to history
   */
  const addToHistory = useCallback((grid: MosaicGridCell[][]) => {
    setHistory(prev => {
      // Remove any states after current index (can't redo after new change)
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(deepCopyGrid(grid));

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        setHistoryIndex(prev => prev - 1);
        return newHistory;
      }

      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex]);

  /**
   * Start painting (mouse down on a cell)
   */
  const startPainting = useCallback((row: number, col: number) => {
    setIsPainting(true);
    setSelectedCells(new Set([`${row}-${col}`]));
  }, []);

  /**
   * Continue painting (mouse move over cells while painting)
   */
  const continuePainting = useCallback((row: number, col: number) => {
    if (!isPainting) return;

    setSelectedCells(prev => {
      const newSet = new Set(prev);
      newSet.add(`${row}-${col}`);
      return newSet;
    });
  }, [isPainting]);

  /**
   * Stop painting (don't apply color - user will pick color after selecting)
   */
  const stopPainting = useCallback(() => {
    setIsPainting(false);
    // Keep selectedCells so user can pick a color to apply
  }, []);

  /**
   * Clear current selection without applying color
   */
  const clearSelection = useCallback(() => {
    setSelectedCells(new Set());
    setIsPainting(false);
  }, []);

  /**
   * Apply flood fill starting from a cell
   */
  const applyFill = useCallback((row: number, col: number) => {
    if (!editedGrid || !selectedColor) return;

    const newGrid = floodFill(editedGrid, row, col, selectedColor);

    // Only update if grid actually changed
    if (newGrid !== editedGrid) {
      setEditedGrid(newGrid);
      addToHistory(newGrid);
    }
  }, [editedGrid, selectedColor, addToHistory]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (canUndo && history.length > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditedGrid(deepCopyGrid(history[newIndex]));
    }
  }, [canUndo, history, historyIndex]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (canRedo && history.length > 0) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditedGrid(deepCopyGrid(history[newIndex]));
    }
  }, [canRedo, history, historyIndex]);

  /**
   * Reset grid to original state
   */
  const resetToOriginal = useCallback(() => {
    if (!originalGrid) return;

    const gridCopy = deepCopyGrid(originalGrid);
    setEditedGrid(gridCopy);
    setHistory([gridCopy]);
    setHistoryIndex(0);
    setSelectedCells(new Set());
  }, [originalGrid]);

  /**
   * Get the current edited grid
   */
  const getEditedGrid = useCallback(() => {
    return editedGrid;
  }, [editedGrid]);

  /**
   * Apply color to selected cells (used when user picks color after selecting pixels)
   */
  const applyColorToSelectedCells = useCallback((newGrid: MosaicGridCell[][]) => {
    setEditedGrid(newGrid);
    addToHistory(newGrid);
    setSelectedCells(new Set()); // Clear selection after applying color
  }, [addToHistory]);

  return {
    isEditing,
    editedGrid,
    selectedColor,
    currentTool,
    selectedCells,
    isPainting,
    canUndo,
    canRedo,
    enterEditMode,
    exitEditMode,
    setSelectedColor,
    setCurrentTool,
    startPainting,
    continuePainting,
    stopPainting,
    clearSelection,
    applyFill,
    undo,
    redo,
    resetToOriginal,
    getEditedGrid,
    applyColorToSelectedCells,
  };
}
