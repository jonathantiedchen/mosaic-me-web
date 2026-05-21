import { useState } from 'react';
import { Download, ZoomIn, ZoomOut, Edit, AlertTriangle } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';
import { useExport } from '../hooks/useExport';
import { MosaicEditor } from './MosaicEditor';
import type { ShoppingListItem, MosaicGridCell } from '../types';

type TabType = 'preview' | 'instructions' | 'shopping';

export function ResultsTabs() {
  const { mosaicData, updateMosaicGrid } = useMosaic();
  const { exportFile, isExporting } = useExport();
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [zoom, setZoom] = useState(0.5);
  const [isEditing, setIsEditing] = useState(false);

  if (!mosaicData) {
    return null;
  }

  const handleExport = (type: 'mosaic-png' | 'instructions-png' | 'shopping-csv' | 'pickabrick-csv', filename: string) => {
    exportFile(mosaicData.sessionId, type, filename);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

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
      <div style={{ borderBottom: '1px solid #2e2a26' }}>
        <nav className="flex">
          {(['preview', 'instructions', 'shopping'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              style={{ flex: 1 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-5 sm:p-6">
        {activeTab === 'preview' && (
          <div className="space-y-4 sm:space-y-6">
            {!isEditing ? (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} disabled={zoom <= 0.5} className="btn-ghost" aria-label="Zoom out">
                      <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <span className="font-sans text-text-subtle" style={{ fontSize: '12px', fontWeight: 500, minWidth: '44px', textAlign: 'center' }}>
                      {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={handleZoomIn} disabled={zoom >= 3} className="btn-ghost" aria-label="Zoom in">
                      <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                    </button>
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
                <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '16px', maxHeight: '600px', overflowY: 'auto', overflowX: 'auto' }}>
                  <img
                    src={mosaicData.previewUrl}
                    alt="Mosaic preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                    className="max-w-none"
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
                      <p className="font-sans text-text-primary" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="panel overflow-hidden" style={{ height: '600px', maxHeight: '80vh' }}>
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
            <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '16px' }}>
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
                  <p className="font-sans text-text-primary" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                    {mosaicData.metadata.totalPieces}
                  </p>
                </div>
                <div className="panel px-4 py-3">
                  <p className="chip-label mb-1">Est. cost</p>
                  <p className="font-sans text-text-primary" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                    ${(mosaicData.metadata.totalPieces * 0.06).toFixed(2)}
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
                  className="flex items-center gap-2"
                  style={{ color: '#c4a882', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  CSV
                </button>
              </div>
            </div>

            {/* Warning for pieces exceeding 999 */}
            {mosaicData.shoppingList.some(item => item.quantity > 999) && (
              <div className="panel p-5" style={{ borderColor: '#c4a882' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" strokeWidth={1.5} />
                  <div>
                    <h4 className="font-sans text-text-primary" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
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
              <h4 className="font-sans text-text-primary" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                How to order from LEGO Pick-a-Brick
              </h4>
              <ol className="font-sans text-text-secondary" style={{ fontSize: '13px', fontWeight: 300, lineHeight: 1.8, paddingLeft: '16px' }}>
                <li>Download the Pick-a-Brick CSV file using the button above</li>
                <li>Visit <a href="https://www.lego.com/pick-and-build/pick-a-brick" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline font-bold transition-colors">LEGO Pick-a-Brick</a></li>
                <li>Click "Upload List" and select the CSV file</li>
                <li>All pieces will be added to your cart automatically</li>
              </ol>
              <p className="font-sans text-text-muted" style={{ fontSize: '11px', fontWeight: 300, marginTop: '12px' }}>
                Price estimate based on ~$0.06 per 1×1 plate. Actual prices vary by region.
              </p>
            </div>

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
  grid: any[][];
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
              <div key={item.colorId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #2e2a26' }}>
                <span className="font-sans text-text-muted" style={{ fontSize: '11px', fontWeight: 500, width: '20px', flexShrink: 0 }}>
                  {index + 1}
                </span>
                <div style={{ width: '20px', height: '20px', borderRadius: '2px', border: '1px solid #2e2a26', flexShrink: 0, backgroundColor: item.hex }} />
                <span className="font-sans text-text-subtle" style={{ fontSize: '12px', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.colorName}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="chip-label mb-3">How to Build</h4>
          <ol className="font-sans text-text-secondary" style={{ fontSize: '12px', fontWeight: 300, lineHeight: 1.8, paddingLeft: '16px' }}>
            <li>Each number in the grid corresponds to a color in the legend</li>
            <li>Place LEGO pieces according to the grid pattern</li>
            <li>Start from the top-left corner, work across and down</li>
            <li>Use the shopping list to order required pieces</li>
          </ol>
        </div>
      </div>
      <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '12px', overflowX: 'auto', overflowY: 'auto' }}>
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

function ShoppingListView({ items }: { items: ShoppingListItem[] }) {
  return (
    <>
      {/* Mobile card view (below sm breakpoint) */}
      <div className="sm:hidden space-y-1">
        {items.map((item) => (
          <div key={item.colorId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #2e2a26' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '2px', border: '1px solid #2e2a26', flexShrink: 0, backgroundColor: item.hex }} />
            <p className="font-sans text-text-subtle" style={{ flex: 1, fontSize: '13px', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.colorName}</p>
            <p className="font-sans text-text-primary" style={{ fontSize: '13px', fontWeight: 500, flexShrink: 0 }}>{item.quantity}</p>
          </div>
        ))}
      </div>

      {/* Desktop table view (sm breakpoint and above) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e2a26' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left' }} className="chip-label">Color</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }} className="chip-label">Name</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }} className="chip-label">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.colorId} style={{ borderBottom: '1px solid #2e2a26' }}>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '2px', border: '1px solid #2e2a26', backgroundColor: item.hex }} />
                </td>
                <td className="font-sans text-text-subtle" style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 300 }}>
                  {item.colorName}
                </td>
                <td className="font-sans text-text-primary" style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 500, textAlign: 'right' }}>
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
