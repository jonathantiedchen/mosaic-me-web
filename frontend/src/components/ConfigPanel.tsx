import { useState } from 'react';
import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { Loader2, Circle, Square, RotateCcw, Sparkles, ChevronDown, ChevronUp, Settings } from 'lucide-react';

const BASEPLATE_SIZES = [32, 48, 64, 96, 128] as const;

export function ConfigPanel() {
  const {
    config,
    setConfig,
    uploadedFile,
    generateMosaic,
    isLoading,
    clearMosaic,
    mosaicData,
  } = useMosaic();

  const hasResults = !!mosaicData;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerate = () => {
    if (uploadedFile) {
      generateMosaic(uploadedFile);
    }
  };

  const handleReset = () => {
    clearMosaic();
    setIsExpanded(false);
  };

  if (hasResults && !isExpanded) {
    return (
      <div className="card p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl backdrop-blur-xl flex-shrink-0">
            <Settings className="w-5 h-5 text-indigo-300" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 text-sm font-medium text-gray-300 truncate">
            <span className="text-white font-bold">{config.baseplateSize}</span>
            <span className="text-gray-500"> studs · </span>
            <span className="text-white font-bold capitalize">{config.pieceType}</span>
            {uploadedFile && (
              <>
                <span className="text-gray-500"> · </span>
                <span className="truncate">{uploadedFile.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 text-sm font-bold text-indigo-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
            Edit
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-40"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover p-7 sm:p-9 space-y-9">
      {hasResults && (
        <div className="flex justify-end -mb-4">
          <button
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2 text-sm font-bold text-indigo-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
          >
            <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
            Collapse
          </button>
        </div>
      )}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/50"></div>
          <h3 className="text-xl font-black text-white tracking-tight">Upload Image</h3>
        </div>
        <ImageUpload />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full shadow-lg shadow-purple-500/50"></div>
          <h3 className="text-xl font-black text-white tracking-tight">Configure Mosaic</h3>
        </div>

        <div className="space-y-7">
          <div>
            <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Baseplate Size
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {BASEPLATE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setConfig({ ...config, baseplateSize: size })
                  }
                  disabled={isLoading}
                  className={`
                    relative px-3 py-3.5 rounded-xl text-sm font-black transition-all duration-300
                    ${
                      config.baseplateSize === size
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-110 z-10'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
                    }
                    disabled:opacity-20 disabled:cursor-not-allowed
                  `}
                  style={config.baseplateSize === size ? {
                    boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.5) inset, 0 12px 32px -8px rgba(99, 102, 241, 0.6), 0 0 60px -15px rgba(139, 92, 246, 0.8)'
                  } : {}}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50"></span>
              Size in studs (1×1 LEGO pieces)
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Piece Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'square' })
                }
                disabled={isLoading}
                className={`
                  relative px-8 py-6 rounded-2xl text-lg font-black flex items-center justify-center gap-3 transition-all duration-300
                  ${
                    config.pieceType === 'square'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
                  }
                  disabled:opacity-20 disabled:cursor-not-allowed
                `}
                style={config.pieceType === 'square' ? {
                  boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.5) inset, 0 12px 32px -8px rgba(99, 102, 241, 0.6), 0 0 60px -15px rgba(139, 92, 246, 0.8)'
                } : {}}
              >
                <Square className="w-7 h-7" strokeWidth={2.5} />
                Square
              </button>
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'round' })
                }
                disabled={isLoading}
                className={`
                  relative px-8 py-6 rounded-2xl text-lg font-black flex items-center justify-center gap-3 transition-all duration-300
                  ${
                    config.pieceType === 'round'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
                  }
                  disabled:opacity-20 disabled:cursor-not-allowed
                `}
                style={config.pieceType === 'round' ? {
                  boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.5) inset, 0 12px 32px -8px rgba(99, 102, 241, 0.6), 0 0 60px -15px rgba(139, 92, 246, 0.8)'
                } : {}}
              >
                <Circle className="w-7 h-7" strokeWidth={2.5} />
                Round
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={handleGenerate}
          disabled={!uploadedFile || isLoading}
          className="btn-primary flex-1 px-10 py-6 flex items-center justify-center gap-3 text-xl disabled:opacity-20 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" strokeWidth={2.5} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-7 h-7" strokeWidth={2.5} />
              <span>Generate Mosaic</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn-secondary px-7 py-6 flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
