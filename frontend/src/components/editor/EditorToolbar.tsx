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
      {/* First Row: Actions */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider mr-2">Actions:</span>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              glass-button px-3 py-2 rounded-lg transition-all duration-200
              ${canUndo
                ? 'text-purple-300 hover:text-white'
                : 'text-purple-300/30 cursor-not-allowed'
              }
            `}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              glass-button px-3 py-2 rounded-lg transition-all duration-200
              ${canRedo
                ? 'text-purple-300 hover:text-white'
                : 'text-purple-300/30 cursor-not-allowed'
              }
            `}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <button
            onClick={onClearSelection}
            className="glass-button px-3 py-2 rounded-lg text-purple-300 hover:text-white transition-all duration-200"
            title="Clear Selection"
          >
            <XIcon className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="glass-button px-3 py-2 rounded-lg text-purple-300 hover:text-white transition-all duration-200"
            title="Reset to Original"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Save/Cancel Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all hover:scale-105 font-semibold border border-white/20"
          >
            <XIcon className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-glow transition-all hover:scale-105 font-semibold"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Second Row: Tools */}
      <div className="flex items-center px-6 py-3">
        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider mr-3">Tools:</span>

        <button
          onClick={() => onToolChange('brush')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${currentTool === 'brush'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'glass-button text-purple-300 hover:text-white'
            }
          `}
          title="Paint Brush Tool"
        >
          <Paintbrush className="w-4 h-4" />
          Brush
        </button>

        <button
          onClick={() => onToolChange('fill')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ml-2
            ${currentTool === 'fill'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'glass-button text-purple-300 hover:text-white'
            }
          `}
          title="Fill Tool (Flood Fill)"
        >
          <Droplet className="w-4 h-4" />
          Fill
        </button>
      </div>
    </div>
  );
}
