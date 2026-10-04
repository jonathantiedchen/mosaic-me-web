import { useState } from 'react';
import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { ChevronDown, RotateCcw } from 'lucide-react';
import type { MosaicConfig } from '../types';

const BASEPLATE_SIZES = [32, 48, 64, 96, 128] as const;
const STUD_CM = 0.8;

type Chip = 'size' | 'type';

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Photo', 'Settings', 'Your mosaic'];
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => {
        const step = i + 1;
        const state = step < current ? 'done' : step === current ? 'current' : 'todo';
        return (
          <li key={label} className="flex items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
            <span
              className={`font-sans font-medium ${state === 'todo' ? 'text-text-muted' : 'text-accent'}`}
              style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              <span className={state === 'current' ? 'text-text-primary' : undefined}>{step}</span>
              {' '}{label}
            </span>
            {step < steps.length && <span className="text-text-muted" aria-hidden>—</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function ConfigPanel() {
  const {
    config,
    setConfig,
    uploadedFile,
    generateMosaic,
    isLoading,
    clearMosaic,
    mosaicData,
    isEdited,
  } = useMosaic();

  const hasResults = !!mosaicData;
  const [expandedChip, setExpandedChip] = useState<Chip | null>(null);

  const handleGenerate = () => {
    if (uploadedFile) generateMosaic(uploadedFile);
  };

  const handleReset = () => {
    clearMosaic();
    setExpandedChip(null);
  };

  const toggleChip = (chip: Chip) => {
    setExpandedChip(prev => (prev === chip ? null : chip));
  };

  // Once a mosaic exists, changing a setting updates it right away
  const applyConfig = (next: MosaicConfig) => {
    setExpandedChip(null);
    if (next.baseplateSize === config.baseplateSize && next.pieceType === config.pieceType) return;
    if (hasResults && isEdited && !window.confirm('Changing this setting rebuilds the mosaic and discards your edits. Continue?')) {
      return;
    }
    setConfig(next);
    if (hasResults && uploadedFile) generateMosaic(uploadedFile, next);
  };

  const pieceTypeLabel = config.pieceType === 'square' ? 'Square' : 'Round';
  const sizeLabel = `${config.baseplateSize} × ${config.baseplateSize}`;
  const step = hasResults ? 3 : uploadedFile ? 2 : 1;

  const option = (selected: boolean) =>
    `font-sans text-sm border${selected ? ' border-accent text-accent bg-bg' : ' border-border text-text-secondary bg-surface hover:border-accent'}`;

  if (!uploadedFile && !hasResults) {
    return <ImageUpload />;
  }

  return (
    <div className="space-y-3">
      <Steps current={step} />

      <ImageUpload />

      {/* Settings */}
      <div className="flex gap-[10px]">
        <button
          className="setting-chip text-left"
          onClick={() => toggleChip('size')}
          aria-expanded={expandedChip === 'size'}
          disabled={isLoading}
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <div className="chip-label">Size</div>
              <div className="chip-value">{sizeLabel}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 mt-1 text-text-muted transition-transform${expandedChip === 'size' ? ' rotate-180' : ''}`} strokeWidth={1.5} />
          </div>
        </button>
        <div className="setting-chip text-left" style={{ cursor: 'default' }} title="More palettes coming later">
          <div className="chip-label">Palette</div>
          <div className="chip-value">Standard</div>
        </div>
        <button
          className="setting-chip text-left"
          onClick={() => toggleChip('type')}
          aria-expanded={expandedChip === 'type'}
          disabled={isLoading}
        >
          <div className="flex items-start justify-between gap-1">
            <div>
              <div className="chip-label">Piece</div>
              <div className="chip-value">{pieceTypeLabel}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 mt-1 text-text-muted transition-transform${expandedChip === 'type' ? ' rotate-180' : ''}`} strokeWidth={1.5} />
          </div>
        </button>
      </div>

      {expandedChip === 'size' && (
        <div className="panel p-4 space-y-3">
          <p className="chip-label">Baseplate size (studs)</p>
          <div className="flex gap-2 flex-wrap">
            {BASEPLATE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => applyConfig({ ...config, baseplateSize: size })}
                disabled={isLoading}
                className={option(config.baseplateSize === size)}
                style={{ borderRadius: 2, padding: '6px 10px' }}
              >
                {size}
                <span className="text-text-muted" style={{ fontSize: '11px', marginLeft: '6px' }}>
                  {Math.round(size * STUD_CM)} cm
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {expandedChip === 'type' && (
        <div className="panel p-4 space-y-3">
          <p className="chip-label">Piece type</p>
          <div className="flex gap-2">
            {(['square', 'round'] as const).map(type => (
              <button
                key={type}
                onClick={() => applyConfig({ ...config, pieceType: type })}
                disabled={isLoading}
                className={`${option(config.pieceType === type)} capitalize`}
                style={{ borderRadius: 2, padding: '6px 10px' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {hasResults ? (
          <button onClick={handleReset} disabled={isLoading} className="btn-ghost flex-1 flex items-center justify-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            {isLoading ? 'Updating…' : 'Start over with a new photo'}
          </button>
        ) : (
          <>
            <button
              onClick={handleGenerate}
              disabled={!uploadedFile || isLoading}
              className="btn-generate flex-1"
            >
              {isLoading ? 'Generating…' : 'Generate mosaic →'}
            </button>
            {uploadedFile && (
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="btn-ghost flex items-center gap-1.5"
                aria-label="Remove photo"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
