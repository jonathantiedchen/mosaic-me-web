import type { MosaicData } from '../types';
import { generatePreviewFromGrid } from '../utils/canvasUtils';

/**
 * Mosaics saved in this browser (IndexedDB). Nothing here is sent to the server;
 * the original photo is kept too, so a saved mosaic can be rebuilt at another size.
 */

export interface SavedMosaic {
  /** The mosaic's sessionId */
  id: string;
  name: string;
  savedAt: string;
  updatedAt: string;
  /** Small PNG data URL for the list */
  thumbnail: string;
  mosaic: Omit<MosaicData, 'previewUrl'>;
  photo: File | null;
}

const DB_NAME = 'mosaic-me';
const STORE = 'saved-mosaics';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser cannot save mosaics'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('This browser cannot save mosaics'));
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error ?? new Error('Saving failed'));
      tx.onabort = () => reject(tx.error ?? new Error('Saving failed, the browser may be out of storage space'));
    });
  } finally {
    db.close();
  }
}

export async function listSavedMosaics(): Promise<SavedMosaic[]> {
  const all = await run<SavedMosaic[]>('readonly', store => store.getAll());
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSavedMosaic(id: string): Promise<SavedMosaic | undefined> {
  return run<SavedMosaic | undefined>('readonly', store => store.get(id));
}

export async function deleteSavedMosaic(id: string): Promise<void> {
  await run('readwrite', store => store.delete(id));
}

export async function renameSavedMosaic(id: string, name: string): Promise<void> {
  const saved = await getSavedMosaic(id);
  if (!saved) return;
  await run('readwrite', store => store.put({ ...saved, name }));
}

/** Insert or update. Keeps the existing name and save date when the mosaic was saved before. */
export async function saveMosaic(mosaic: MosaicData, photo: File | null, name?: string): Promise<SavedMosaic> {
  const existing = await getSavedMosaic(mosaic.sessionId);
  const now = new Date().toISOString();
  // previewUrl is rebuilt from the grid on open, so it is not stored twice
  const { previewUrl: _previewUrl, ...rest } = mosaic;
  const record: SavedMosaic = {
    id: mosaic.sessionId,
    name: name ?? existing?.name ?? defaultName(mosaic, photo),
    savedAt: existing?.savedAt ?? now,
    updatedAt: now,
    thumbnail: generatePreviewFromGrid(mosaic.grid, Math.max(1, Math.round(160 / mosaic.grid.length))),
    mosaic: rest,
    photo: photo ?? existing?.photo ?? null,
  };
  await run('readwrite', store => store.put(record));
  return record;
}

export function toMosaicData(saved: SavedMosaic): MosaicData {
  return { ...saved.mosaic, previewUrl: generatePreviewFromGrid(saved.mosaic.grid) };
}

function defaultName(mosaic: MosaicData, photo: File | null): string {
  const base = photo?.name.replace(/\.[^.]+$/, '');
  const size = `${mosaic.metadata.baseplateSize} × ${mosaic.metadata.baseplateSize}`;
  return base ? `${base} (${size})` : `Mosaic ${size}`;
}
