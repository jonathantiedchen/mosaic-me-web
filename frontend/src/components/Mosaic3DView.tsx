import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Camera, RotateCcw } from 'lucide-react';
import type { MosaicGridCell } from '../types';

// Dimensions in stud pitches (1 unit = 8mm), matching real LEGO 1x1 plates
const PLATE_HEIGHT = 0.4; // 3.2mm
const STUD_RADIUS = 0.3; // 4.8mm diameter
const STUD_HEIGHT = 0.2125; // 1.7mm
const PIECE_GAP = 0.02; // Thin seam so individual pieces read clearly
const BASEPLATE_HEIGHT = 0.15;
const BASEPLATE_COLOR = '#1b1b1b';

type ViewPreset = 'angled' | 'front' | 'top';

interface Mosaic3DViewProps {
  grid: MosaicGridCell[][];
  pieceType: 'round' | 'square';
}

function createPieceGeometry(pieceType: 'round' | 'square'): THREE.BufferGeometry {
  const width = 1 - PIECE_GAP;
  const body = pieceType === 'round'
    ? new THREE.CylinderGeometry(width / 2, width / 2, PLATE_HEIGHT, 24)
    : new THREE.BoxGeometry(width, PLATE_HEIGHT, width);
  body.translate(0, PLATE_HEIGHT / 2, 0);

  const stud = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 20);
  stud.translate(0, PLATE_HEIGHT + STUD_HEIGHT / 2, 0);

  // Box and cylinder geometries differ in index/attribute layout; normalise before merging
  const merged = mergeGeometries([body.toNonIndexed(), stud.toNonIndexed()]);
  body.dispose();
  stud.dispose();
  return merged;
}

/**
 * Interactive 3D render of the mosaic: every cell is an instanced 1x1 plate
 * with a stud, so even a 128x128 mosaic is a single draw call.
 */
export default function Mosaic3DView({ grid, pieceType }: Mosaic3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setViewRef = useRef<(preset: ViewPreset) => void>(() => {});
  const snapshotRef = useRef<() => void>(() => {});
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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c1917');

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, size * 20);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Never look from below the baseplate
    controls.minDistance = 4;
    controls.maxDistance = size * 6;

    // Lighting: soft fill plus a key light whose shadows pick out each stud
    scene.add(new THREE.HemisphereLight('#ffffff', '#3a3530', 1.6));
    const keyLight = new THREE.DirectionalLight('#fff6ea', 2.2);
    keyLight.position.set(-size * 0.6, size * 1.2, size * 0.9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(4096, 4096);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const shadowExtent = size * 0.75;
    Object.assign(keyLight.shadow.camera, {
      left: -shadowExtent,
      right: shadowExtent,
      top: shadowExtent,
      bottom: -shadowExtent,
      near: 1,
      far: size * 4,
    });
    scene.add(keyLight);

    // Baseplate
    const baseGeometry = new THREE.BoxGeometry(size, BASEPLATE_HEIGHT, size);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: BASEPLATE_COLOR, roughness: 0.6 });
    const baseplate = new THREE.Mesh(baseGeometry, baseMaterial);
    baseplate.position.y = -BASEPLATE_HEIGHT / 2;
    baseplate.receiveShadow = true;
    scene.add(baseplate);

    // Pieces: rows run front-to-back so the image's top edge is furthest from the default camera
    const pieceGeometry = createPieceGeometry(pieceType);
    const pieceMaterial = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0 });
    const pieces = new THREE.InstancedMesh(pieceGeometry, pieceMaterial, size * size);
    pieces.castShadow = true;
    pieces.receiveShadow = true;

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const offset = (size - 1) / 2;
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const index = rowIndex * size + colIndex;
        matrix.makeTranslation(colIndex - offset, 0, rowIndex - offset);
        pieces.setMatrixAt(index, matrix);
        pieces.setColorAt(index, color.set(cell.hex));
      });
    });
    scene.add(pieces);

    const viewDirections: Record<ViewPreset, THREE.Vector3> = {
      // Tiny z offset keeps OrbitControls' up-vector stable while looking straight down
      top: new THREE.Vector3(0, 1, 0.001),
      front: new THREE.Vector3(0, 0.45, 1),
      angled: new THREE.Vector3(-0.35, 0.8, 0.75),
    };
    const setView = (preset: ViewPreset) => {
      // Distance at which the plate's bounding sphere fits the narrower field of view
      const radius = size * 0.72;
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const distance = radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2);
      camera.position.copy(viewDirections[preset]).normalize().multiplyScalar(distance);
      controls.target.set(0, 0, 0);
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
        link.download = 'mosaic-3d.png';
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
    setView('angled');

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
      pieceGeometry.dispose();
      pieceMaterial.dispose();
      pieces.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [grid, pieceType]);

  if (error) {
    return (
      <div className="flex items-center justify-center text-text-secondary text-sm" style={{ height: '320px' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {(['angled', 'front', 'top'] as ViewPreset[]).map((preset) => (
            <button key={preset} onClick={() => setViewRef.current(preset)} className="btn-ghost">
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
          <button onClick={() => setViewRef.current('angled')} className="btn-ghost" aria-label="Reset view">
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
        Drag to rotate · scroll or pinch to zoom · right-drag to pan
      </p>
    </div>
  );
}
