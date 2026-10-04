import { useState } from 'react';
import type { MosaicGridCell } from '../types';
import Mosaic3DView from './Mosaic3DView';
import PhotoMockupView from './PhotoMockupView';
import { PHOTO_SCENES, fitsScene } from './photoMockups';
import type { SceneKind } from './mosaicScenes';

type Selection = { type: 'photo'; id: string } | { type: '3d'; kind: SceneKind };

const SCENES_3D: Array<{ kind: SceneKind; label: string }> = [
  { kind: 'studio', label: 'Studio' },
  { kind: 'shelf', label: 'Shelf' },
  { kind: 'wall', label: 'Wall' },
];

interface MosaicVisualizerProps {
  grid: MosaicGridCell[][];
  pieceType: 'round' | 'square';
}

/** Scene picker: the mosaic in real interior photos, or interactive 3D views */
export default function MosaicVisualizer({ grid, pieceType }: MosaicVisualizerProps) {
  const [selection, setSelection] = useState<Selection>({ type: 'photo', id: PHOTO_SCENES[0].id });

  // A scene picked for an earlier, smaller mosaic may not fit anymore: fall back to the first photo that does
  const fitting = PHOTO_SCENES.filter((s) => fitsScene(s, grid.length));
  const activePhoto = selection.type === 'photo'
    ? fitting.find((s) => s.id === selection.id) ?? fitting[0]
    : undefined;
  const active3d = selection.type === '3d' ? selection.kind : activePhoto ? undefined : 'studio';

  const chip = (selected: boolean) => `btn-ghost${selected ? ' border-accent text-text-primary' : ''}`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Photo scenes">
          <span className="chip-label" style={{ width: '44px' }}>Photo</span>
          {PHOTO_SCENES.map((scene) => {
            const fits = fitsScene(scene, grid.length);
            return (
              <button
                key={scene.id}
                onClick={() => setSelection({ type: 'photo', id: scene.id })}
                disabled={!fits}
                title={fits ? undefined : 'This mosaic is too large for this scene'}
                aria-pressed={activePhoto?.id === scene.id}
                className={chip(activePhoto?.id === scene.id)}
              >
                {scene.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="3D scenes">
          <span className="chip-label" style={{ width: '44px' }}>3D</span>
          {SCENES_3D.map(({ kind, label }) => (
            <button
              key={kind}
              onClick={() => setSelection({ type: '3d', kind })}
              aria-pressed={active3d === kind}
              className={chip(active3d === kind)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activePhoto ? (
        <PhotoMockupView scene={activePhoto} grid={grid} pieceType={pieceType} />
      ) : (
        <Mosaic3DView grid={grid} pieceType={pieceType} sceneKind={active3d ?? 'studio'} />
      )}
    </div>
  );
}
