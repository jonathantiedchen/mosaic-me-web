import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { Loader2, Circle, Square, RotateCcw } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4">Image</h3>
        <ImageUpload />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4">Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
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
                    px-3 py-2.5 rounded text-sm font-medium transition-colors
                    ${
                      config.baseplateSize === size
                        ? 'bg-red-600 text-white'
                        : 'card card-hover text-gray-300'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Size in studs (1×1 LEGO pieces)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Piece Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  setConfig({ ...config, pieceType: 'square' })
                }
                disabled={isLoading}
                className={`
                  px-4 py-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors
                  ${
                    config.pieceType === 'square'
                      ? 'bg-red-600 text-white'
                      : 'card card-hover text-gray-300'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
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
                  px-4 py-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors
                  ${
                    config.pieceType === 'round'
                      ? 'bg-red-600 text-white'
                      : 'card card-hover text-gray-300'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Circle className="w-4 h-4" />
                Round
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={handleGenerate}
          disabled={!uploadedFile || isLoading}
          className="btn-primary flex-1 px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate Mosaic</span>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn-secondary px-4 py-3 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
