import { useState } from 'react';
import { Bookmark, Check, Copy, Link2 } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';
import { apiService } from '../services/api';
import type { MosaicGridCell } from '../types';

/** Save the mosaic in this browser, or get a link that opens it anywhere */
export function SaveCard() {
  const { mosaicData, isSavedLocally, saveLocally } = useMosaic();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // A link is a snapshot, so remember which grid it was made from
  const [link, setLink] = useState<{ url: string; grid: MosaicGridCell[][] } | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!mosaicData) return null;

  const linkIsCurrent = link?.grid === mosaicData.grid;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await saveLocally();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Saving failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLink = async () => {
    setIsLinking(true);
    setLinkError('');
    setCopied(false);
    try {
      const id = await apiService.createShareLink(mosaicData);
      setLink({ url: `${window.location.origin}/m/${id}`, grid: mosaicData.grid });
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Could not create a link');
    } finally {
      setIsLinking(false);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
    } catch {
      // Clipboard blocked: the field is selectable, so the link can still be copied by hand
    }
  };

  return (
    <div className="panel p-4 space-y-3">
      <p className="chip-label">Save</p>

      {isSavedLocally ? (
        <p role="status" className="flex items-start gap-2 font-sans text-text-subtle" style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" strokeWidth={1.5} />
          Saved in this browser. Your edits are saved automatically.
        </p>
      ) : (
        <button onClick={handleSave} disabled={isSaving} className="btn-ghost w-full flex items-center justify-center gap-2">
          <Bookmark className="w-4 h-4" strokeWidth={1.5} />
          {isSaving ? 'Saving…' : 'Save in this browser'}
        </button>
      )}
      {saveError && <p role="alert" className="text-error-light" style={{ fontSize: '12px' }}>{saveError}</p>}

      {link && linkIsCurrent ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              readOnly
              value={link.url}
              aria-label="Share link"
              onFocus={e => e.target.select()}
              className="flex-1 min-w-0 font-sans bg-surface text-text-primary border border-border"
              style={{ borderRadius: '2px', fontSize: '12px', padding: '8px 10px', outline: 'none' }}
            />
            <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5" style={{ padding: '8px 10px' }}>
              {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={handleLink} disabled={isLinking} className="btn-ghost w-full flex items-center justify-center gap-2">
          <Link2 className="w-4 h-4" strokeWidth={1.5} />
          {isLinking ? 'Creating link…' : link ? 'Get an updated link' : 'Get a share link'}
        </button>
      )}
      {link && !linkIsCurrent && (
        <p className="font-sans text-text-muted" style={{ fontSize: '12px' }}>
          You changed the mosaic since your last link, which still shows the old version.
        </p>
      )}
      {linkError && <p role="alert" className="text-error-light" style={{ fontSize: '12px' }}>{linkError}</p>}

      <p className="font-sans text-text-muted" style={{ fontSize: '12px', lineHeight: 1.6 }}>
        Links open the mosaic on any device and show it as it is now. They store only the brick
        colors, not your photo, and expire after a year without being opened.
      </p>
    </div>
  );
}
