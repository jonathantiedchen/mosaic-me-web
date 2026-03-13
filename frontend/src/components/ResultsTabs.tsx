import { useState } from 'react';
import { Download, ZoomIn, ZoomOut, Image as ImageIcon, BookOpen, ShoppingCart, Loader2, Edit } from 'lucide-react';
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
    <div className="card card-hover overflow-hidden">
      <div className="border-b border-white/5 backdrop-blur-xl bg-gradient-to-r from-white/5 to-transparent">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`
              flex-1 px-6 py-5 text-sm font-bold transition-all duration-300
              flex items-center justify-center gap-3 relative uppercase tracking-wider
              ${
                activeTab === 'preview'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
            <span>Preview</span>
            {activeTab === 'preview' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`
              flex-1 px-6 py-5 text-sm font-bold transition-all duration-300
              flex items-center justify-center gap-3 relative uppercase tracking-wider
              ${
                activeTab === 'instructions'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            <span>Instructions</span>
            {activeTab === 'instructions' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`
              flex-1 px-6 py-5 text-sm font-bold transition-all duration-300
              flex items-center justify-center gap-3 relative uppercase tracking-wider
              ${
                activeTab === 'shopping'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
            <span>Shopping</span>
            {activeTab === 'shopping' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"></div>
            )}
          </button>
        </nav>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'preview' && (
          <div className="space-y-4 sm:space-y-6">
            {!isEditing ? (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="btn-secondary p-3.5 disabled:opacity-10 disabled:cursor-not-allowed"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <span className="text-sm font-black text-white min-w-[80px] text-center px-5 py-3 card backdrop-blur-xl">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="btn-secondary p-3.5 disabled:opacity-10 disabled:cursor-not-allowed"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEditMosaic}
                      className="btn-secondary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold"
                    >
                      <Edit className="w-5 h-5" strokeWidth={2.5} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleExport('mosaic-png', `mosaic-${mosaicData.sessionId}.png`)}
                      disabled={isExporting}
                      className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm disabled:opacity-20"
                    >
                      {isExporting ? (
                        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      ) : (
                        <Download className="w-5 h-5" strokeWidth={2.5} />
                      )}
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <div className="relative overflow-auto rounded-3xl border border-white/10 bg-gradient-to-br from-black/60 via-indigo-950/20 to-black/60 p-6 max-h-[600px] backdrop-blur-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none"></div>
                  <img
                    src={mosaicData.previewUrl}
                    alt="Mosaic preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                    className="relative max-w-none rounded-2xl shadow-2xl shadow-indigo-900/30"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative card card-hover p-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <p className="relative text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Size</p>
                    <p className="relative text-white font-black text-2xl">
                      {mosaicData.metadata.baseplateSize}×{mosaicData.metadata.baseplateSize}
                    </p>
                  </div>
                  <div className="relative card card-hover p-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <p className="relative text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Pieces</p>
                    <p className="relative text-white font-black text-2xl">
                      {mosaicData.metadata.totalPieces}
                    </p>
                  </div>
                  <div className="relative card card-hover p-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <p className="relative text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Colors</p>
                    <p className="relative text-white font-black text-2xl">
                      {mosaicData.metadata.uniqueColors}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden" style={{ height: '600px', maxHeight: '80vh' }}>
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
                className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold disabled:opacity-20"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Download className="w-5 h-5" strokeWidth={2.5} />
                )}
                <span>Download</span>
              </button>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-xl p-3 sm:p-4 lg:p-6">
              <InstructionsView grid={mosaicData.grid} shoppingList={mosaicData.shoppingList} />
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-6">
              <div className="card card-hover px-6 py-4 backdrop-blur-xl">
                <p className="text-sm font-bold text-white">
                  Total: <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{mosaicData.metadata.totalPieces}</span> pieces
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('pickabrick-csv', `pickabrick-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold disabled:opacity-20"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                  )}
                  <span>Pick-a-Brick</span>
                </button>
                <button
                  onClick={() => handleExport('shopping-csv', `shopping-list-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-secondary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold disabled:opacity-20"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                  )}
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Pick-a-Brick Instructions */}
            <div className="relative card card-hover p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none"></div>
              <div className="relative flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full shadow-lg shadow-amber-500/50"></div>
                <h4 className="font-black text-white text-lg tracking-tight">
                  How to order from LEGO Pick-a-Brick
                </h4>
              </div>
              <ol className="relative text-sm text-gray-300 space-y-4 list-decimal list-inside font-medium">
                <li>Download the Pick-a-Brick CSV file using the button above</li>
                <li>Visit <a href="https://www.lego.com/pick-and-build/pick-a-brick" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline font-bold transition-colors">LEGO Pick-a-Brick</a></li>
                <li>Click "Upload List" and select the CSV file</li>
                <li>All pieces will be added to your cart automatically</li>
              </ol>
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
          <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            Color Legend
          </h4>
          <div className="space-y-1.5 sm:space-y-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
            {shoppingList.map((item, index) => (
              <div key={item.colorId} className="flex items-center gap-2 sm:gap-3 p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-xs sm:text-sm font-bold text-purple-300 w-6 sm:w-8 flex-shrink-0">
                  {index + 1}
                </span>
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-white/30 shadow-lg flex-shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-xs sm:text-sm text-white font-medium truncate">{item.colorName}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            How to Build
          </h4>
          <div className="text-xs sm:text-sm text-purple-100 space-y-2 sm:space-y-3 bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">1.</span>
              <span>Each number in the grid corresponds to a color in the legend</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">2.</span>
              <span>Place LEGO pieces according to the grid pattern</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">3.</span>
              <span>Start from the top-left corner and work across and down</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">4.</span>
              <span>Use the shopping list to order required pieces</span>
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-auto bg-white/5 rounded-lg p-2 sm:p-3 lg:p-4 border border-white/10">
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
                className="flex items-center justify-center text-xs font-bold shadow-sm"
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
      <div className="sm:hidden space-y-2">
        {items.map((item) => (
          <div key={item.colorId} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-white/30 shadow-lg flex-shrink-0"
                style={{ backgroundColor: item.hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{item.colorName}</p>
                <p className="text-xs text-purple-300 mt-0.5">Quantity: <span className="font-bold text-white">{item.quantity}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view (sm breakpoint and above) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/20">
            <tr>
              <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                Color
              </th>
              <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 lg:px-6 lg:py-4 text-right text-xs font-bold text-purple-300 uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((item) => (
              <tr key={item.colorId} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 lg:px-6 lg:py-4">
                  <div
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg border-2 border-white/30 shadow-lg"
                    style={{ backgroundColor: item.hex }}
                  />
                </td>
                <td className="px-4 py-3 lg:px-6 lg:py-4 text-sm text-white font-medium">
                  {item.colorName}
                </td>
                <td className="px-4 py-3 lg:px-6 lg:py-4 text-sm text-white text-right font-bold">
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
