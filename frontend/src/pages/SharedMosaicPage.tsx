import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useMosaic } from '../hooks/useMosaic';
import { apiService } from '../services/api';

/** Opens a share link (/m/:id), then shows the mosaic on the main page */
export function SharedMosaicPage() {
  const { id = '' } = useParams();
  const { loadMosaic } = useMosaic();
  const [state, setState] = useState<'loading' | 'done' | string>('loading');

  useEffect(() => {
    let cancelled = false;
    apiService.openSharedMosaic(id)
      .then(mosaic => {
        if (cancelled) return;
        loadMosaic(mosaic, null);
        setState('done');
      })
      .catch(err => !cancelled && setState(err instanceof Error ? err.message : 'Could not open this mosaic'));
    return () => {
      cancelled = true;
    };
  }, [id, loadMosaic]);

  if (state === 'done') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {state === 'loading' ? (
        <div className="flex flex-col items-center gap-4" role="status">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-text-secondary" style={{ fontSize: '14px' }}>Opening mosaic…</p>
        </div>
      ) : (
        <div className="panel p-6 text-center" style={{ maxWidth: '380px' }}>
          <p className="font-serif text-text-primary" style={{ fontSize: '22px', marginBottom: '8px' }}>Mosaic not found</p>
          <p className="font-sans text-text-secondary" style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{state}</p>
          <Link to="/" className="btn-generate">Make your own mosaic</Link>
        </div>
      )}
    </div>
  );
}
