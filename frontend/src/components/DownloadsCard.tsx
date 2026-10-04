import { AlertTriangle, Download, X } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';
import { useExport } from '../hooks/useExport';

/** Everything the user needs to build and order, in one click */
export function DownloadsCard() {
  const { mosaicData } = useMosaic();
  const { exportFile, isExporting, exportError, clearExportError } = useExport();

  if (!mosaicData) return null;

  return (
    <div className="panel p-4 space-y-3">
      <div>
        <p className="chip-label">Downloads</p>
        <p className="font-sans text-text-secondary" style={{ fontSize: '12px', lineHeight: 1.6, marginTop: '4px' }}>
          Mosaic image, building instructions, Pick-a-Brick CSV, BrickLink wanted list and shopping list.
        </p>
      </div>
      <button
        onClick={() => exportFile(mosaicData, 'all-zip', `mosaic-${mosaicData.metadata.baseplateSize}x${mosaicData.metadata.baseplateSize}.zip`)}
        disabled={isExporting}
        className="btn-generate"
      >
        <Download className="w-4 h-4" strokeWidth={1.5} />
        {isExporting ? 'Preparing…' : 'Download everything (.zip)'}
      </button>
      {exportError && <ExportError message={exportError} onDismiss={clearExportError} />}
    </div>
  );
}

export function ExportError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-2 text-error-light" style={{ fontSize: '12px' }}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" strokeWidth={1.5} />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-text-muted hover:text-text-primary">
        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
