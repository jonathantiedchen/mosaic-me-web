import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';
import {
  deleteSavedMosaic,
  listSavedMosaics,
  renameSavedMosaic,
  toMosaicData,
  type SavedMosaic,
} from '../services/savedMosaics';

/** Mosaics saved in this browser, shown on the start page */
export function SavedMosaics() {
  const { loadMosaic } = useMosaic();
  const [saved, setSaved] = useState<SavedMosaic[]>([]);

  const refresh = () => listSavedMosaics().then(setSaved).catch(() => setSaved([]));

  useEffect(() => {
    refresh();
  }, []);

  if (saved.length === 0) return null;

  const handleRename = async (item: SavedMosaic) => {
    const name = window.prompt('Name this mosaic', item.name)?.trim();
    if (!name || name === item.name) return;
    await renameSavedMosaic(item.id, name.slice(0, 80));
    refresh();
  };

  const handleDelete = async (item: SavedMosaic) => {
    if (!window.confirm(`Delete "${item.name}" from this browser?`)) return;
    await deleteSavedMosaic(item.id);
    refresh();
  };

  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="saved-title">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <h2 id="saved-title" className="font-serif text-text-primary" style={{ fontSize: '24px' }}>
          Your saved mosaics
        </h2>
        <p className="font-sans text-text-muted" style={{ fontSize: '12px' }}>Stored in this browser only</p>
      </div>
      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {saved.map(item => (
          <li key={item.id} className="panel overflow-hidden flex flex-col">
            <button
              onClick={() => loadMosaic(toMosaicData(item), item.photo, { savedLocally: true })}
              className="block text-left group"
              aria-label={`Open ${item.name}`}
            >
              <img
                src={item.thumbnail}
                alt=""
                className="w-full aspect-square object-cover block border-b border-border group-hover:opacity-90 transition-opacity"
                style={{ imageRendering: 'pixelated' }}
              />
            </button>
            <div className="p-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-sans text-text-primary truncate" style={{ fontSize: '13px' }} title={item.name}>{item.name}</p>
                <p className="font-sans text-text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                  {item.mosaic.metadata.baseplateSize} × {item.mosaic.metadata.baseplateSize} · {item.mosaic.metadata.pieceType}
                  {' · '}{new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleRename(item)} aria-label={`Rename ${item.name}`} className="p-1 text-text-muted hover:text-text-primary">
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(item)} aria-label={`Delete ${item.name}`} className="p-1 text-text-muted hover:text-error-light">
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
