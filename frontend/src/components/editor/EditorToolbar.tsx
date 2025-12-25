import { Paintbrush, Droplet, Undo, Redo, X as XIcon, RotateCcw, Save } from 'lucide-react';
import type { EditorTool } from '../../types';

interface EditorToolbarProps {
  currentTool: EditorTool;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearSelection: () => void;
  onReset: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditorToolbar({
  currentTool,
  canUndo,
  canRedo,
  onToolChange,
  onUndo,
  onRedo,
  onClearSelection,
  onReset,
  onSave,
  onCancel,
}: EditorToolbarProps) {
  return (
    <div className="bg-white/5 border-b border-white/10">
      {/* First Row: Actions and Save/Cancel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 gap-2 sm:gap-0 border-b border-white/10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] xs:text-xs font-semibold text-purple-300 uppercase tracking-wider mr-1 sm:mr-2 flex-shrink-0">Actions:</span>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              glass-button px-2.5 py-2 sm:px-3 rounded-lg transition-all duration-200 touch-manipulation
              ${canUndo
                ? 'text-purple-300 hover:text-white'
                : 'text-purple-300/30 cursor-not-allowed'
              }
            `}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              glass-button px-2.5 py-2 sm:px-3 rounded-lg transition-all duration-200 touch-manipulation
              ${canRedo
                ? 'text-purple-300 hover:text-white'
                : 'text-purple-300/30 cursor-not-allowed'
              }
            `}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onClearSelection}
            className="glass-button px-2.5 py-2 sm:px-3 rounded-lg text-purple-300 hover:text-white transition-all duration-200 touch-manipulation"
            title="Clear Selection"
          >
            <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onReset}
            className="glass-button px-2.5 py-2 sm:px-3 rounded-lg text-purple-300 hover:text-white transition-all duration-200 touch-manipulation"
            title="Reset to Original"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Save/Cancel Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all hover:scale-105 font-semibold border border-white/20 text-xs sm:text-sm touch-manipulation"
          >
            <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Cancel</span>
          </button>
          <button
            onClick={onSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:shadow-glow transition-all hover:scale-105 font-semibold text-xs sm:text-sm touch-manipulation"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Save Changes</span>
            <span className="xs:hidden">Save</span>
          </button>
        </div>
      </div>

      {/* Second Row: Tools */}
      <div className="flex items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <span className="text-[10px] xs:text-xs font-semibold text-purple-300 uppercase tracking-wider mr-2 sm:mr-3 flex-shrink-0">Tools:</span>

        <button
          onClick={() => onToolChange('brush')}
          className={`
            flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 touch-manipulation
            ${currentTool === 'brush'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'glass-button text-purple-300 hover:text-white'
            }
          `}
          title="Paint Brush Tool"
        >
          <Paintbrush className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Brush</span>
        </button>

        <button
          onClick={() => onToolChange('fill')}
          className={`
            flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ml-1.5 sm:ml-2 touch-manipulation
            ${currentTool === 'fill'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'glass-button text-purple-300 hover:text-white'
            }
          `}
          title="Fill Tool (Flood Fill)"
        >
          <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Fill</span>
        </button>
      </div>
    </div>
  );
}
