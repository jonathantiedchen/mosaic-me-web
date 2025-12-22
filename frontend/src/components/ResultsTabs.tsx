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
    return (
      <div className="glass-card p-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 bg-white/10 rounded-full">
            <ImageIcon className="w-12 h-12 text-purple-300" />
          </div>
          <p className="text-purple-200 text-lg">
            Upload an image and generate a mosaic to see results
          </p>
        </div>
      </div>
    );
  }

  const handleExport = (type: 'mosaic-png' | 'instructions-png' | 'shopping-csv', filename: string) => {
    exportFile(mosaicData.sessionId, type, filename);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  const handleEditMosaic = () => {
    setIsEditing(true);
  };

  const handleSaveEdits = (newGrid: MosaicGridCell[], newShoppingList: ShoppingListItem[]) => {
    updateMosaicGrid(newGrid, newShoppingList);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-white/10 bg-white/5">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`
              flex-1 px-6 py-5 text-sm font-semibold transition-all duration-200
              flex items-center justify-center gap-2 relative
              ${
                activeTab === 'preview'
                  ? 'text-white'
                  : 'text-purple-300 hover:text-purple-100'
              }
            `}
          >
            <ImageIcon className="w-4 h-4" />
            Mosaic Preview
            {activeTab === 'preview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`
              flex-1 px-6 py-5 text-sm font-semibold transition-all duration-200
              flex items-center justify-center gap-2 relative
              ${
                activeTab === 'instructions'
                  ? 'text-white'
                  : 'text-purple-300 hover:text-purple-100'
              }
            `}
          >
            <BookOpen className="w-4 h-4" />
            Instructions
            {activeTab === 'instructions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`
              flex-1 px-6 py-5 text-sm font-semibold transition-all duration-200
              flex items-center justify-center gap-2 relative
              ${
                activeTab === 'shopping'
                  ? 'text-white'
                  : 'text-purple-300 hover:text-purple-100'
              }
            `}
          >
            <ShoppingCart className="w-4 h-4" />
            Shopping List
            {activeTab === 'shopping' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            )}
          </button>
        </nav>
      </div>

      <div className="p-8">
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-5 h-5 text-purple-200" />
                    </button>
                    <span className="text-sm font-bold text-white min-w-[70px] text-center px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-5 h-5 text-purple-200" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEditMosaic}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-glow transition-all hover:scale-105 font-semibold"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Mosaic
                    </button>
                    <button
                      onClick={() => handleExport('mosaic-png', `mosaic-${mosaicData.sessionId}.png`)}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-glow transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download PNG
                    </button>
                  </div>
                </div>
                <div className="overflow-auto border border-white/20 rounded-xl bg-white/5 p-4 max-h-[600px]">
                  <img
                    src={mosaicData.previewUrl}
                    alt="Mosaic preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                    className="max-w-none rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <p className="text-purple-300 text-xs font-medium mb-1">Size</p>
                    <p className="text-white font-bold">{mosaicData.metadata.baseplateSize}×{mosaicData.metadata.baseplateSize}</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <p className="text-purple-300 text-xs font-medium mb-1">Total Pieces</p>
                    <p className="text-white font-bold">{mosaicData.metadata.totalPieces}</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <p className="text-purple-300 text-xs font-medium mb-1">Colors</p>
                    <p className="text-white font-bold">{mosaicData.metadata.uniqueColors}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden" style={{ height: '800px' }}>
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
          <div className="space-y-6">
            <div className="flex items-center justify-end flex-wrap gap-3">
              <button
                onClick={() => handleExport('instructions-png', `instructions-${mosaicData.sessionId}.png`)}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-glow transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download PNG
              </button>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <InstructionsView grid={mosaicData.grid} shoppingList={mosaicData.shoppingList} />
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
                <p className="text-sm font-semibold text-purple-200">
                  Total: <span className="text-white">{mosaicData.metadata.totalPieces} pieces</span>
                </p>
              </div>
              <button
                onClick={() => handleExport('shopping-csv', `shopping-list-${mosaicData.sessionId}.csv`)}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-glow transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download CSV
              </button>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            Color Legend
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {shoppingList.map((item, index) => (
              <div key={item.colorId} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-sm font-bold text-purple-300 w-8">
                  {index + 1}
                </span>
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/30 shadow-lg"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-sm text-white font-medium">{item.colorName}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            How to Build
          </h4>
          <div className="text-sm text-purple-100 space-y-3 bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300">1.</span>
              Each number in the grid corresponds to a color in the legend
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300">2.</span>
              Place LEGO pieces according to the grid pattern
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300">3.</span>
              Start from the top-left corner and work across and down
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300">4.</span>
              Use the shopping list to order required pieces
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-auto bg-white/5 rounded-lg p-4 border border-white/10">
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/20">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
              Color
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-purple-300 uppercase tracking-wider">
              Quantity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {items.map((item) => (
            <tr key={item.colorId} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white/30 shadow-lg"
                  style={{ backgroundColor: item.hex }}
                />
              </td>
              <td className="px-6 py-4 text-sm text-white font-medium">
                {item.colorName}
              </td>
              <td className="px-6 py-4 text-sm text-white text-right font-bold">
                {item.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getBrightness(rgb: [number, number, number]): number {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
}
