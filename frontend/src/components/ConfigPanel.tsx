import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { Loader2, Circle, Square, RotateCcw, Sparkles } from 'lucide-react';

const BASEPLATE_SIZES = [32, 48, 64, 96, 128] as const;

export function ConfigPanel() {
  const {
    config,
    setConfig,
    uploadedFile,
    generateMosaic,
    isLoading,
    clearMosaic,
  } = useMosaic();

  const handleGenerate = () => {
    if (uploadedFile) {
      generateMosaic(uploadedFile);
    }
  };

  const handleReset = () => {
    clearMosaic();
  };

  return (
    <div className="card p-6 sm:p-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h3 className="text-lg font-bold text-white">Upload Image</h3>
        </div>
        <ImageUpload />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-amber-500 rounded-full"></div>
          <h3 className="text-lg font-bold text-white">Configure Mosaic</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Baseplate Size
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BASEPLATE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setConfig({ ...config, baseplateSize: size })
                  }
                  disabled={isLoading}
                  className={`
                    px-3 py-3 rounded-xl text-sm font-bold transition-all
                    ${
                      config.baseplateSize === size
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-blue-500/30'
                    }
                    disabled:opacity-30 disabled:cursor-not-allowed
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-blue-400"></span>
              Size in studs (1×1 LEGO pieces)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Piece Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'square' })
                }
                disabled={isLoading}
                className={`
                  px-5 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all
                  ${
                    config.pieceType === 'square'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-blue-500/30'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed
                `}
              >
                <Square className="w-5 h-5" strokeWidth={2.5} />
                Square
              </button>
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'round' })
                }
                disabled={isLoading}
                className={`
                  px-5 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all
                  ${
                    config.pieceType === 'round'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-blue-500/30'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed
                `}
              >
                <Circle className="w-5 h-5" strokeWidth={2.5} />
                Round
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleGenerate}
          disabled={!uploadedFile || isLoading}
          className="btn-primary flex-1 px-6 py-4 flex items-center justify-center gap-2.5 text-base disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              <span>Generate Mosaic</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn-secondary px-5 py-4 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
