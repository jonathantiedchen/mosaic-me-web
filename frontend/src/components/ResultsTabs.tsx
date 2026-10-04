import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Download, ZoomIn, ZoomOut, Edit, AlertTriangle, Image as ImageIcon, Sofa, ListOrdered, ShoppingCart, type LucideIcon } from 'lucide-react';
import { ExportError } from './DownloadsCard';
import { useMosaic } from '../hooks/useMosaic';
import { useExport } from '../hooks/useExport';
import { MosaicEditor } from './MosaicEditor';
import { apiService } from '../services/api';
import type { ShoppingListItem, MosaicGridCell, ExportType } from '../types';

// three.js and the room photos are large; only load them when the tab is opened
const MosaicVisualizer = lazy(() => import('./MosaicVisualizer'));

type TabType = 'preview' | '3d' | 'instructions' | 'shopping';

// Short labels keep all four tabs on one line on phones
const TABS: Record<TabType, { label: string; short: string; icon: LucideIcon }> = {
  preview: { label: 'Preview', short: 'Preview', icon: ImageIcon },
  '3d': { label: 'In your home', short: 'Home', icon: Sofa },
  instructions: { label: 'Instructions', short: 'Build', icon: ListOrdered },
  shopping: { label: 'Shopping', short: 'Parts', icon: ShoppingCart },
};

export function ResultsTabs() {
  const { mosaicData, updateMosaicGrid } = useMosaic();
  const { exportFile, isExporting, exportError, clearExportError } = useExport();
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  // null = fit the preview to the available width (the default, so it never overflows on phones)
  const [zoom, setZoom] = useState<number | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!mosaicData) {
    return null;
  }

  const handleExport = (type: ExportType, filename: string) => {
    exportFile(mosaicData, type, filename);
  };

  const fitZoom = () => {
    const box = previewBoxRef.current;
    return box && naturalWidth ? (box.clientWidth - 32) / naturalWidth : 1;
  };
  const handleZoomIn = () => setZoom((z) => Math.min((z ?? fitZoom()) + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max((z ?? fitZoom()) - 0.25, 0.25));

  const handleEditMosaic = () => {
    setIsEditing(true);
  };

  const handleSaveEdits = (newGrid: MosaicGridCell[][], newShoppingList: ShoppingListItem[]) => {
    updateMosaicGrid(newGrid, newShoppingList);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border">
        <nav className="flex" role="tablist">
          {(Object.keys(TABS) as TabType[]).map(tab => {
            const { label, short, icon: Icon } = TABS[tab];
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn flex items-center justify-center gap-1.5${activeTab === tab ? ' active' : ''}`}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 sm:p-6">
        {exportError && (
          <div className="mb-4">
            <ExportError message={exportError} onDismiss={clearExportError} />
          </div>
        )}
        {activeTab === 'preview' && (
          <div className="space-y-4 sm:space-y-6">
            {!isEditing ? (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} disabled={zoom !== null && zoom <= 0.25} className="btn-ghost" aria-label="Zoom out">
                      <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <span className="font-sans text-text-subtle font-medium" style={{ fontSize: '12px', minWidth: '44px', textAlign: 'center' }} aria-live="polite">
                      {zoom === null ? 'Fit' : `${Math.round(zoom * 100)}%`}
                    </span>
                    <button onClick={handleZoomIn} disabled={zoom !== null && zoom >= 4} className="btn-ghost" aria-label="Zoom in">
                      <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    {zoom !== null && (
                      <button onClick={() => setZoom(null)} className="btn-ghost">Fit</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleEditMosaic} className="btn-ghost flex items-center gap-2">
                      <Edit className="w-4 h-4" strokeWidth={1.5} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleExport('mosaic-png', `mosaic-${mosaicData.sessionId}.png`)}
                      disabled={isExporting}
                      className="btn-generate"
                      style={{ width: 'auto', padding: '9px 16px' }}
                    >
                      <Download className="w-4 h-4" strokeWidth={1.5} />
                      {isExporting ? 'Downloading…' : 'Download'}
                    </button>
                  </div>
                </div>
                <div ref={previewBoxRef} className="border border-border" style={{ borderRadius: '2px', padding: '16px', maxHeight: '70vh', overflow: 'auto' }}>
                  <img
                    src={mosaicData.previewUrl}
                    alt="Mosaic preview"
                    onLoad={(e) => setNaturalWidth(e.currentTarget.naturalWidth)}
                    style={{
                      // Fit: as wide as the box, but never taller than it (mosaics are square)
                      width: zoom === null ? 'min(100%, calc(70vh - 34px))' : `${naturalWidth * zoom}px`,
                      height: 'auto',
                      margin: zoom === null ? '0 auto' : undefined,
                      imageRendering: 'pixelated',
                    }}
                    className="max-w-none block"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Size', value: `${mosaicData.metadata.baseplateSize}×${mosaicData.metadata.baseplateSize}` },
                    { label: 'Pieces', value: mosaicData.metadata.totalPieces },
                    { label: 'Colors', value: mosaicData.metadata.uniqueColors },
                  ].map(({ label, value }) => (
                    <div key={label} className="panel p-4">
                      <p className="chip-label mb-2">{label}</p>
                      <p className="font-sans text-text-primary font-semibold" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="panel overflow-hidden" style={{ height: '820px' }}>
                <MosaicEditor
                  grid={mosaicData.grid}
                  shoppingList={mosaicData.shoppingList}
                  pieceType={mosaicData.metadata.pieceType}
                  onSave={handleSaveEdits}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === '3d' && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center text-text-secondary text-sm" style={{ height: '320px' }}>
                Loading…
              </div>
            }
          >
            <MosaicVisualizer grid={mosaicData.grid} pieceType={mosaicData.metadata.pieceType} />
          </Suspense>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => handleExport('instructions-png', `instructions-${mosaicData.sessionId}.png`)}
                disabled={isExporting}
                className="btn-generate"
                style={{ width: 'auto', padding: '9px 16px' }}
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                {isExporting ? 'Downloading…' : 'Download'}
              </button>
            </div>
            <div className="border border-border" style={{ borderRadius: '2px', padding: '16px' }}>
              <InstructionsView grid={mosaicData.grid} shoppingList={mosaicData.shoppingList} />
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="panel px-4 py-3">
                  <p className="chip-label mb-1">Total pieces</p>
                  <p className="font-sans text-text-primary font-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                    {mosaicData.metadata.totalPieces}
                  </p>
                </div>
                <div className="panel px-4 py-3">
                  <p className="chip-label mb-1">Approx. cost*</p>
                  <p className="font-sans text-text-primary font-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                    ≈ ${Math.round(mosaicData.metadata.totalPieces * 0.06)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('pickabrick-csv', `pickabrick-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-generate"
                  style={{ width: 'auto', padding: '9px 16px' }}
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Pick-a-Brick
                </button>
                <button
                  onClick={() => handleExport('shopping-csv', `shopping-list-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="flex items-center gap-2 font-medium text-accent text-sm"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  CSV
                </button>
              </div>
            </div>

            {/* Warning for pieces exceeding 999 */}
            {mosaicData.shoppingList.some(item => item.quantity > 999) && (
              <div className="panel p-5 border-accent">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" strokeWidth={1.5} />
                  <div>
                    <h4 className="font-sans text-text-primary font-semibold" style={{ fontSize: '13px', marginBottom: '6px' }}>
                      Quantity Limit Warning
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Some pieces exceed the Pick-a-Brick maximum of 999 per color. When uploading to LEGO's website, you'll need to split these orders or manually adjust quantities. The affected colors are:
                    </p>
                    <ul className="mt-3 space-y-1">
                      {mosaicData.shoppingList
                        .filter(item => item.quantity > 999)
                        .map(item => (
                          <li key={item.colorId} className="text-sm text-accent font-medium flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-white/30" style={{ backgroundColor: item.hex }} />
                            {item.colorName}: <span className="font-bold">{item.quantity}</span> pieces (exceeds by {item.quantity - 999})
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="panel p-5">
              <h4 className="font-sans text-text-primary font-semibold" style={{ fontSize: '13px', marginBottom: '12px' }}>
                How to order from LEGO Pick-a-Brick
              </h4>
              <ol className="font-sans text-text-secondary" style={{ fontSize: '13px', lineHeight: 1.8, paddingLeft: '16px' }}>
                <li>Download the Pick-a-Brick CSV file using the button above</li>
                <li>Visit <a href="https://www.lego.com/pick-and-build/pick-a-brick" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline font-bold transition-colors">LEGO Pick-a-Brick</a></li>
                <li>Click "Upload List" and select the CSV file</li>
                <li>All pieces will be added to your cart automatically</li>
              </ol>
              <p className="font-sans text-text-muted" style={{ fontSize: '12px', marginTop: '12px' }}>
                * Rough estimate at ~$0.06 per 1×1 plate. Actual prices vary by shop, region and colour.
              </p>
            </div>

            <BrickLinkPanel
              items={mosaicData.shoppingList}
              pieceType={mosaicData.metadata.pieceType}
              isExporting={isExporting}
              onExport={() => handleExport('bricklink-xml', `bricklink-${mosaicData.sessionId}.xml`)}
            />

            <ShoppingListView items={mosaicData.shoppingList} />
          </div>
        )}
      </div>
    </div>
  );
}

function InstructionsView({
  grid,
  shoppingList,
}: {
  grid: MosaicGridCell[][];
  shoppingList: ShoppingListItem[];
}) {
  const colorMap = new Map<string, number>();
  shoppingList.forEach((item, index) => {
    colorMap.set(item.colorId, index + 1);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h4 className="chip-label mb-3">Color Legend</h4>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {shoppingList.map((item, index) => (
              <div key={item.colorId} className="border-b border-border" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <span className="font-sans text-text-muted font-medium" style={{ fontSize: '12px', width: '20px', flexShrink: 0 }}>
                  {index + 1}
                </span>
                <div className="border border-border" style={{ width: '20px', height: '20px', borderRadius: '2px', flexShrink: 0, backgroundColor: item.hex }} />
                <span className="font-sans text-text-subtle" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.colorName}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="chip-label mb-3">How to Build</h4>
          <ol className="font-sans text-text-secondary" style={{ fontSize: '12px', lineHeight: 1.8, paddingLeft: '16px' }}>
            <li>Each number in the grid corresponds to a color in the legend</li>
            <li>Place LEGO pieces according to the grid pattern</li>
            <li>Start from the top-left corner, work across and down</li>
            <li>Use the shopping list to order required pieces</li>
          </ol>
        </div>
      </div>
      <div className="border border-border" style={{ borderRadius: '2px', padding: '12px', overflowX: 'auto', overflowY: 'auto' }}>
        <div
          className="grid gap-px bg-white/20 inline-block p-px rounded"
          style={{
            gridTemplateColumns: `repeat(${grid[0].length}, minmax(20px, 1fr))`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: cell.hex,
                  color: getBrightness(cell.rgb) > 128 ? '#000' : '#fff',
                  width: '20px',
                  height: '20px',
                }}
                title={cell.colorName}
              >
                {colorMap.get(cell.colorId)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BrickLinkPanel({
  items,
  pieceType,
  isExporting,
  onExport,
}: {
  items: ShoppingListItem[];
  pieceType: 'round' | 'square';
  isExporting: boolean;
  onExport: () => void;
}) {
  // Colors not sold in this part on BrickLink are left out of the XML; name them so counts aren't silently short
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    apiService
      .getPaletteColors(pieceType)
      .then((palette) => {
        if (cancelled) return;
        setUnavailableIds(new Set(palette.colors.filter((c) => c.bricklinkColorId == null).map((c) => c.id)));
      })
      .catch((err) => console.error('Failed to load palette for BrickLink check:', err));
    return () => {
      cancelled = true;
    };
  }, [pieceType]);

  const unavailable = items.filter((item) => unavailableIds.has(item.colorId));

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="font-sans text-text-primary font-semibold" style={{ fontSize: '13px', marginBottom: '12px' }}>
            Order from BrickLink or Brick Owl
          </h4>
          <ol className="font-sans text-text-secondary" style={{ fontSize: '13px', lineHeight: 1.8, paddingLeft: '16px' }}>
            <li>Download the BrickLink XML file</li>
            <li>
              On <a href="https://www.bricklink.com/v2/wanted/upload.page" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline font-bold transition-colors">BrickLink</a>,
              open Wanted → Upload, choose "BrickLink XML format" and paste the file's contents
            </li>
            <li>Use Easy Buy on the new wanted list to find stores that have most of your pieces</li>
            <li>For Brick Owl: Wishlist → Import → BrickLink XML</li>
          </ol>
          <p className="font-sans text-text-muted" style={{ fontSize: '12px', marginTop: '12px' }}>
            No per-color quantity limit, and often cheaper for large mosaics.
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="btn-generate"
          style={{ width: 'auto', padding: '9px 16px' }}
        >
          <Download className="w-4 h-4" strokeWidth={1.5} />
          BrickLink XML
        </button>
      </div>

      {unavailable.length > 0 && (
        <div className="flex items-start gap-3" style={{ marginTop: '16px' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" strokeWidth={1.5} />
          <div className="text-sm text-text-secondary leading-relaxed">
            Not sold as {pieceType} 1×1 plates on BrickLink, so left out of the XML — order these elsewhere or swap the color in the editor:
            <ul className="mt-2 space-y-1">
              {unavailable.map((item) => (
                <li key={item.colorId} className="text-accent font-medium flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/30" style={{ backgroundColor: item.hex }} />
                  {item.colorName}: {item.quantity} pieces
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingListView({ items }: { items: ShoppingListItem[] }) {
  return (
    <>
      {/* Mobile card view (below sm breakpoint) */}
      <div className="sm:hidden space-y-1">
        {items.map((item) => (
          <div key={item.colorId} className="border-b border-border" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <div className="border border-border" style={{ width: '20px', height: '20px', borderRadius: '2px', flexShrink: 0, backgroundColor: item.hex }} />
            <p className="font-sans text-text-subtle" style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.colorName}</p>
            <p className="font-sans text-text-primary font-medium" style={{ fontSize: '13px', flexShrink: 0 }}>{item.quantity}</p>
          </div>
        ))}
      </div>

      {/* Desktop table view (sm breakpoint and above) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="border-b border-border">
              <th style={{ padding: '8px 12px', textAlign: 'left' }} className="chip-label">Color</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }} className="chip-label">Name</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }} className="chip-label">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.colorId} className="border-b border-border">
                <td style={{ padding: '8px 12px' }}>
                  <div className="border border-border" style={{ width: '20px', height: '20px', borderRadius: '2px', backgroundColor: item.hex }} />
                </td>
                <td className="font-sans text-text-subtle" style={{ padding: '8px 12px', fontSize: '13px' }}>
                  {item.colorName}
                </td>
                <td className="font-sans text-text-primary font-medium" style={{ padding: '8px 12px', fontSize: '13px', textAlign: 'right' }}>
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getBrightness(rgb: [number, number, number]): number {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
}
