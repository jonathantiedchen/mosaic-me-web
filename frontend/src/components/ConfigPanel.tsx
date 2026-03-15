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
    <div className="card card-hover p-7 sm:p-9 space-y-9">
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
                  relative px-6 py-4.5 rounded-xl text-base font-black flex items-center justify-center gap-3 transition-all duration-300
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
                <Square className="w-6 h-6" strokeWidth={2.5} />
                Square
              </button>
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'round' })
                }
                disabled={isLoading}
                className={`
                  relative px-6 py-4.5 rounded-xl text-base font-black flex items-center justify-center gap-3 transition-all duration-300
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
                <Circle className="w-6 h-6" strokeWidth={2.5} />
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
          className="btn-primary flex-1 px-7 py-4.5 flex items-center justify-center gap-3 text-lg disabled:opacity-20 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" strokeWidth={2.5} />
              <span>Generate Mosaic</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn-secondary px-6 py-4.5 flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
