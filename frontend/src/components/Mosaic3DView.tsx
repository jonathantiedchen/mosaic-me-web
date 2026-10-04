import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera, RotateCcw } from 'lucide-react';
import type { MosaicGridCell } from '../types';
import { createMosaic, disposeObject, stageMosaic, type SceneKind } from './mosaicScenes';

const STUD_PITCH_CM = 0.8;

interface Mosaic3DViewProps {
  grid: MosaicGridCell[][];
  pieceType: 'round' | 'square';
  sceneKind: SceneKind;
}

/**
 * Interactive 3D render of the mosaic, either on its own (studio) or at true
 * scale in a room, so users can judge how big the finished piece will be.
 */
export default function Mosaic3DView({ grid, pieceType, sceneKind }: Mosaic3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setViewRef = useRef<(view?: string) => void>(() => {});
  const snapshotRef = useRef<() => void>(() => {});
  const [views, setViews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || grid.length === 0) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setError('Your browser does not support WebGL, which the 3D view needs.');
      return;
    }
    setError(null);

    const size = grid.length;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const staged = stageMosaic(sceneKind, createMosaic(grid, pieceType), size);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(staged.background);
    scene.add(staged.root);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.5, staged.radius * 30);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = staged.maxPolarAngle;
    controls.minDistance = 4;
    controls.maxDistance = staged.radius * 8;

    const viewNames = Object.keys(staged.views);
    setViews(viewNames);

    const setView = (view = viewNames[0]) => {
      // Distance at which the scene's bounding sphere fits the narrower field of view
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const distance = staged.radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2);
      camera.position
        .copy(staged.views[view] ?? staged.views[viewNames[0]])
        .normalize()
        .multiplyScalar(distance)
        .add(staged.center);
      controls.target.copy(staged.center);
      if (staged.azimuthRange !== undefined) {
        // Keep room scenes viewed from the front; walls have no back side
        controls.minAzimuthAngle = -staged.azimuthRange;
        controls.maxAzimuthAngle = staged.azimuthRange;
      }
      controls.update();
    };
    setViewRef.current = setView;

    snapshotRef.current = () => {
      renderer.render(scene, camera);
      renderer.domElement.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mosaic-${sceneKind}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    setView();

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [grid, pieceType, sceneKind]);

  if (error) {
    return (
      <div className="flex items-center justify-center text-text-secondary text-sm" style={{ height: '320px' }}>
        {error}
      </div>
    );
  }

  const sideCm = (grid.length * STUD_PITCH_CM).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {views.map((view) => (
            <button key={view} onClick={() => setViewRef.current(view)} className="btn-ghost">
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
          <button onClick={() => setViewRef.current()} className="btn-ghost" aria-label="Reset view">
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <button onClick={() => snapshotRef.current()} className="btn-ghost flex items-center gap-2">
          <Camera className="w-4 h-4" strokeWidth={1.5} />
          Save image
        </button>
      </div>
      <div
        ref={containerRef}
        className="border border-border overflow-hidden"
        style={{ borderRadius: '2px', height: 'min(70vh, 640px)', minHeight: '320px', cursor: 'grab', touchAction: 'none' }}
      />
      <p className="font-sans text-text-muted" style={{ fontSize: '11px' }}>
        {sceneKind === 'studio'
          ? 'Drag to rotate · scroll or pinch to zoom · right-drag to pan'
          : `Shown at true scale: ${sideCm} × ${sideCm} cm, plus a 2.5 cm frame · drag to look around`}
      </p>
    </div>
  );
}
