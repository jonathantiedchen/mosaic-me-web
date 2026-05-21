import { useState } from 'react';
import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { RotateCcw } from 'lucide-react';

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
  const [expandedChip, setExpandedChip] = useState<'size' | 'palette' | 'type' | null>(null);

  const handleGenerate = () => {
    if (uploadedFile) generateMosaic(uploadedFile);
  };

  const handleReset = () => {
    clearMosaic();
    setExpandedChip(null);
  };

  const toggleChip = (chip: 'size' | 'palette' | 'type') => {
    setExpandedChip(prev => (prev === chip ? null : chip));
  };

  const pieceTypeLabel = config.pieceType === 'square' ? 'Square' : 'Round';
  const sizeLabel = `${config.baseplateSize} × ${config.baseplateSize}`;

  return (
    <div className="space-y-3">
      <ImageUpload />

      {/* Chips row */}
      <div className="flex gap-2">
        <button className="setting-chip text-left" onClick={() => toggleChip('size')}>
          <div className="chip-label">Size</div>
          <div className="chip-value">{sizeLabel}</div>
        </button>
        <button className="setting-chip text-left" onClick={() => toggleChip('palette')}>
          <div className="chip-label">Palette</div>
          <div className="chip-value">Standard</div>
        </button>
        <button className="setting-chip text-left" onClick={() => toggleChip('type')}>
          <div className="chip-label">Piece</div>
          <div className="chip-value">{pieceTypeLabel}</div>
        </button>
      </div>

      {/* Size expander */}
      {expandedChip === 'size' && (
        <div className="panel p-4 space-y-3">
          <p className="chip-label">Baseplate size (studs)</p>
          <div className="flex gap-2 flex-wrap">
            {BASEPLATE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => { setConfig({ ...config, baseplateSize: size }); setExpandedChip(null); }}
                disabled={isLoading}
                style={{
                  border: `1px solid ${config.baseplateSize === size ? '#c4a882' : '#2e2a26'}`,
                  background: config.baseplateSize === size ? '#2a241e' : '#1c1917',
                  color: config.baseplateSize === size ? '#c4a882' : '#7a716c',
                  borderRadius: '2px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Piece type expander */}
      {expandedChip === 'type' && (
        <div className="panel p-4 space-y-3">
          <p className="chip-label">Piece type</p>
          <div className="flex gap-2">
            {(['square', 'round'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setConfig({ ...config, pieceType: type }); setExpandedChip(null); }}
                disabled={isLoading}
                style={{
                  border: `1px solid ${config.pieceType === type ? '#c4a882' : '#2e2a26'}`,
                  background: config.pieceType === type ? '#2a241e' : '#1c1917',
                  color: config.pieceType === type ? '#c4a882' : '#7a716c',
                  borderRadius: '2px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleGenerate}
          disabled={!uploadedFile || isLoading}
          className="btn-generate flex-1"
        >
          {isLoading ? 'Generating…' : 'Generate mosaic →'}
        </button>
        {(uploadedFile || hasResults) && (
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="btn-ghost flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {uploadedFile && (
        <p className="text-text-muted text-center" style={{ fontSize: '10px', fontWeight: 300 }}>
          Not affiliated with the LEGO Group
        </p>
      )}
    </div>
  );
}
