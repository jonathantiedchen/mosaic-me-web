import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { Loader2, Grid3x3, Circle, Square, Sparkles, RotateCcw } from 'lucide-react';

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
    <div className="glass-card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 lg:sticky lg:top-8">
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4 lg:mb-5">
          <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Upload Image
          </h2>
        </div>
        <ImageUpload />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4 lg:mb-5">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Mosaic Settings
          </h3>
        </div>

        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-purple-200 mb-2 sm:mb-3">
              Baseplate Size
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {BASEPLATE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setConfig({ ...config, baseplateSize: size })
                  }
                  disabled={isLoading}
                  className={`
                    px-3 py-3.5 sm:px-2 sm:py-3 rounded-xl text-sm font-bold transition-all duration-200
                    hover:scale-105 active:scale-95 touch-manipulation
                    ${
                      config.baseplateSize === size
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-glow'
                        : 'bg-white/10 text-purple-100 hover:bg-white/20 border border-white/20'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-purple-300 mt-2 sm:mt-3 flex items-center gap-1">
              <Grid3x3 className="w-3 h-3" />
              Size in studs (1×1 LEGO pieces)
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-purple-200 mb-2 sm:mb-3">
              Piece Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'square' })
                }
                disabled={isLoading}
                className={`
                  px-4 py-3.5 sm:py-4 rounded-xl text-sm font-semibold transition-all duration-200
                  hover:scale-105 active:scale-95 flex items-center justify-center gap-2 touch-manipulation
                  ${
                    config.pieceType === 'square'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-glow'
                      : 'bg-white/10 text-purple-100 hover:bg-white/20 border border-white/20'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
              >
                <Square className="w-4 h-4" />
                Square
              </button>
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'round' })
                }
                disabled={isLoading}
                className={`
                  px-4 py-3.5 sm:py-4 rounded-xl text-sm font-semibold transition-all duration-200
                  hover:scale-105 active:scale-95 flex items-center justify-center gap-2 touch-manipulation
                  ${
                    config.pieceType === 'round'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-glow'
                      : 'bg-white/10 text-purple-100 hover:bg-white/20 border border-white/20'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `}
              >
                <Circle className="w-4 h-4" />
                Round
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
        <button
          onClick={handleGenerate}
          disabled={!uploadedFile || isLoading}
          className="
            flex-1 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white
            px-4 py-3.5 sm:px-6 sm:py-4 rounded-xl font-bold shadow-lg hover:shadow-glow
            hover:scale-105 active:scale-95 touch-manipulation
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-200 flex items-center justify-center gap-2
            text-sm sm:text-base
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span className="hidden xs:inline">Generating...</span>
              <span className="xs:hidden">...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Generate Mosaic</span>
              <span className="xs:hidden">Generate</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="
            px-4 py-3.5 sm:px-6 sm:py-4 rounded-xl font-semibold glass-button
            text-white hover:scale-105 active:scale-95 disabled:opacity-50 touch-manipulation
            disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200
            flex items-center gap-2
          "
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
