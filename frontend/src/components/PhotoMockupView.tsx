import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import type { MosaicGridCell } from '../types';
import { renderPhotoMockup, type PhotoScene } from './photoMockups';

const photoCache = new Map<string, Promise<HTMLImageElement>>();

function loadPhoto(src: string): Promise<HTMLImageElement> {
  if (!photoCache.has(src)) {
    photoCache.set(src, new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        photoCache.delete(src);
        reject(new Error(`Could not load ${src}`));
      };
      img.src = src;
    }));
  }
  return photoCache.get(src)!;
}

interface PhotoMockupViewProps {
  scene: PhotoScene;
  grid: MosaicGridCell[][];
  pieceType: 'round' | 'square';
}

/** The mosaic composited into a real interior photo at true scale */
export default function PhotoMockupView({ scene, grid, pieceType }: PhotoMockupViewProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'rendering' | 'ready' | 'error'>('rendering');

  useEffect(() => {
    let cancelled = false;
    setStatus('rendering');
    loadPhoto(scene.src)
      .then((photo) => new Promise<HTMLImageElement>((resolve) => setTimeout(() => resolve(photo), 0))) // let "Rendering…" paint
      .then((photo) => {
        if (cancelled || !holderRef.current) return;
        const canvas = renderPhotoMockup(scene, photo, grid, pieceType);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `Your mosaic in a ${scene.label.toLowerCase()} at true scale`);
        holderRef.current.replaceChildren(canvas);
        canvasRef.current = canvas;
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Photo mockup failed:', err);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [scene, grid, pieceType]);

  const save = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mosaic-${scene.id}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.92);
  };

  const sideCm = (grid.length * 0.8).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button onClick={save} disabled={status !== 'ready'} className="btn-ghost flex items-center gap-2">
          <Camera className="w-4 h-4" strokeWidth={1.5} />
          Save image
        </button>
      </div>
      <div className="relative border border-border overflow-hidden" style={{ borderRadius: '2px', minHeight: '200px' }}>
        <div ref={holderRef} />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm">
            {status === 'error' ? 'Could not render this scene.' : 'Rendering…'}
          </div>
        )}
      </div>
      <p className="font-sans text-text-muted" style={{ fontSize: '12px' }}>
        True scale: {sideCm} × {sideCm} cm · Photo by{' '}
        <a href={scene.credit.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-text-secondary">
          {scene.credit.name}
        </a>{' '}
        on Unsplash
      </p>
    </div>
  );
}
