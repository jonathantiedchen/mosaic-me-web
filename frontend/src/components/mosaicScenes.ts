import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MosaicGridCell } from '../types';

// All dimensions are in stud pitches: 1 unit = 8mm, so furniture and the mosaic share a true scale
const CM = 1.25;

// Real LEGO 1x1 plate proportions
const PLATE_HEIGHT = 0.4; // 3.2mm
const STUD_RADIUS = 0.3; // 4.8mm diameter
const STUD_HEIGHT = 0.2125; // 1.7mm
const PIECE_GAP = 0.02; // Thin seam so individual pieces read clearly
const BASEPLATE_HEIGHT = 0.15;

// Picture frame around the mosaic in room scenes
const FRAME_BORDER = 2.5 * CM;
const FRAME_BACK = BASEPLATE_HEIGHT + 1; // Distance from the stud-side plate surface to the frame's back face
const FRAME_FRONT = 1.4; // Frame lip stands just proud of the stud tops

export type SceneKind = 'studio' | 'shelf' | 'wall';

export interface StagedScene {
  root: THREE.Group;
  background: string;
  /** Sphere the camera should fit in view */
  center: THREE.Vector3;
  radius: number;
  /** Named camera directions (from center towards the camera); the first is the default */
  views: Record<string, THREE.Vector3>;
  /** OrbitControls limits */
  maxPolarAngle: number;
  azimuthRange?: number;
}

// Small seeded PRNG so procedural textures look identical on every render and in saved images
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function woodTexture(base: string, grain: string, planks = 0, seed = 1): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const random = seededRandom(seed);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = grain;
  for (let i = 0; i < 110; i++) {
    ctx.globalAlpha = 0.04 + random() * 0.12;
    ctx.lineWidth = 0.5 + random() * 2;
    const y = random() * size;
    const phase = random() * 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 16) {
      ctx.lineTo(x, y + Math.sin(x / 70 + phase) * 2.5);
    }
    ctx.stroke();
  }
  if (planks > 0) {
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    for (let p = 1; p < planks; p++) {
      const y = (p * size) / planks;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  shadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position);
  m.castShadow = shadows;
  m.receiveShadow = true;
  return m;
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
 * The mosaic lying flat (studs up, +y) on a baseplate, centred on the origin.
 * Rows run front-to-back so the image's top edge points to -z.
 * Every cell is one instance of a single mesh, so even 128x128 is one draw call.
 */
export function createMosaic(grid: MosaicGridCell[][], pieceType: 'round' | 'square'): THREE.Group {
  const size = grid.length;
  const group = new THREE.Group();

  const baseplate = mesh(
    new THREE.BoxGeometry(size, BASEPLATE_HEIGHT, size),
    new THREE.MeshStandardMaterial({ color: '#1b1b1b', roughness: 0.6 }),
    [0, -BASEPLATE_HEIGHT / 2, 0],
    false
  );
  group.add(baseplate);

  const pieces = new THREE.InstancedMesh(
    createPieceGeometry(pieceType),
    new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0 }),
    size * size
  );
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
  group.add(pieces);
  return group;
}

/** Mosaic stood upright in a black frame: image faces +z, back face at z = -FRAME_BACK. */
function createFramedMosaic(mosaic: THREE.Group, size: number): { framed: THREE.Group; outerSize: number } {
  const framed = new THREE.Group();
  mosaic.rotation.x = Math.PI / 2; // Studs now face +z and image row 0 is at the top
  framed.add(mosaic);

  const outerSize = size + FRAME_BORDER * 2;
  const depth = FRAME_BACK + FRAME_FRONT;
  const zCenter = (FRAME_FRONT - FRAME_BACK) / 2;
  const frameMaterial = new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.45 });
  const edge = size / 2 + FRAME_BORDER / 2;
  const horizontal = new THREE.BoxGeometry(outerSize, FRAME_BORDER, depth);
  const vertical = new THREE.BoxGeometry(FRAME_BORDER, size, depth);
  framed.add(mesh(horizontal, frameMaterial, [0, edge, zCenter]));
  framed.add(mesh(horizontal, frameMaterial, [0, -edge, zCenter]));
  framed.add(mesh(vertical, frameMaterial, [edge, 0, zCenter]));
  framed.add(mesh(vertical, frameMaterial, [-edge, 0, zCenter]));
  framed.add(mesh(
    new THREE.BoxGeometry(outerSize, outerSize, 0.6),
    frameMaterial,
    [0, 0, -FRAME_BACK + 0.3]
  ));
  return { framed, outerSize };
}

function createPlant(potColor: string, scale = 1): THREE.Group {
  const plant = new THREE.Group();
  const potHeight = 12 * CM * scale;
  const potRadius = 6.5 * CM * scale;
  plant.add(mesh(
    new THREE.CylinderGeometry(potRadius, potRadius * 0.8, potHeight, 32),
    new THREE.MeshStandardMaterial({ color: potColor, roughness: 0.8 }),
    [0, potHeight / 2, 0]
  ));

  const random = seededRandom(7);
  const leafGeometry = new THREE.SphereGeometry(1, 12, 8);
  const leafMaterials = ['#4f7a4a', '#5f8f56', '#3f6a3d'].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  for (let i = 0; i < 14; i++) {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterials[i % leafMaterials.length]);
    const angle = (i / 14) * Math.PI * 2 + random() * 0.4;
    const reach = (2 + random() * 5) * CM * scale;
    const height = potHeight + (3 + random() * 12) * CM * scale;
    leaf.position.set(Math.cos(angle) * reach, height, Math.sin(angle) * reach);
    leaf.scale.set(2.2 * CM * scale, 0.5 * CM * scale, 5 * CM * scale);
    leaf.rotation.set(random() * 0.8 - 0.4, -angle, 0.6 + random() * 0.5);
    leaf.castShadow = true;
    plant.add(leaf);
  }
  return plant;
}

function createBookStack(): THREE.Group {
  const stack = new THREE.Group();
  const books: Array<[string, number, number, number]> = [
    // color, width, height, depth (cm)
    ['#2f4858', 25, 3.5, 18],
    ['#b8643a', 23, 2.5, 16],
    ['#e6dcc6', 21, 4, 15],
  ];
  let y = 0;
  books.forEach(([color, w, h, d], index) => {
    const book = mesh(
      new THREE.BoxGeometry(w * CM, h * CM, d * CM),
      new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
      [0, y + (h * CM) / 2, 0]
    );
    book.rotation.y = (index - 1) * 0.08;
    stack.add(book);
    y += h * CM;
  });
  return stack;
}

function addRoomLights(root: THREE.Group, center: THREE.Vector3, radius: number) {
  root.add(new THREE.HemisphereLight('#fff6ec', '#6b5f55', 1.25));

  // Soft "window" light from the upper left, casting the frame's shadow onto the wall
  const sun = new THREE.DirectionalLight('#fff1e0', 2.4);
  sun.position.copy(center).add(new THREE.Vector3(-0.9, 1.1, 1.3).multiplyScalar(radius * 2));
  sun.target.position.copy(center);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 3;
  const extent = radius * 1.3;
  Object.assign(sun.shadow.camera, {
    left: -extent, right: extent, top: extent, bottom: -extent, near: 1, far: radius * 6,
  });
  root.add(sun, sun.target);

  const fill = new THREE.DirectionalLight('#dfe8ff', 0.5);
  fill.position.copy(center).add(new THREE.Vector3(1, 0.4, 1).multiplyScalar(radius * 2));
  root.add(fill);
}

function stageStudio(mosaic: THREE.Group, size: number): StagedScene {
  const root = new THREE.Group();
  root.add(mosaic);

  root.add(new THREE.HemisphereLight('#ffffff', '#3a3530', 1.6));
  const keyLight = new THREE.DirectionalLight('#fff6ea', 2.2);
  keyLight.position.set(-size * 0.6, size * 1.2, size * 0.9);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(4096, 4096);
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  const extent = size * 0.75;
  Object.assign(keyLight.shadow.camera, {
    left: -extent, right: extent, top: extent, bottom: -extent, near: 1, far: size * 4,
  });
  root.add(keyLight);

  return {
    root,
    background: '#1c1917',
    center: new THREE.Vector3(0, 0, 0),
    radius: size * 0.72,
    views: {
      angled: new THREE.Vector3(-0.35, 0.8, 0.75),
      front: new THREE.Vector3(0, 0.45, 1),
      // Tiny z offset keeps OrbitControls' up-vector stable while looking straight down
      top: new THREE.Vector3(0, 1, 0.001),
    },
    maxPolarAngle: Math.PI / 2 - 0.02, // Never look from below the baseplate
  };
}

function stageShelf(mosaic: THREE.Group, size: number): StagedScene {
  const root = new THREE.Group();
  const { framed, outerSize } = createFramedMosaic(mosaic, size);

  const shelfWidth = Math.max(120 * CM, outerSize + 75 * CM);
  const shelfDepth = 24 * CM;
  const shelfThickness = 3.5 * CM;
  const wallHeight = Math.max(260 * CM, outerSize * 4);

  root.add(mesh(
    new THREE.PlaneGeometry(shelfWidth * 4, wallHeight * 2),
    new THREE.MeshStandardMaterial({ color: '#e9e3da', roughness: 0.95 }),
    [0, 0, 0],
    false
  ));

  const shelfTexture = woodTexture('#b9875a', '#5c3a1e', 0, 3);
  shelfTexture.repeat.set(2, 1);
  root.add(mesh(
    new THREE.BoxGeometry(shelfWidth, shelfThickness, shelfDepth),
    new THREE.MeshStandardMaterial({ map: shelfTexture, roughness: 0.6 }),
    [0, -shelfThickness / 2, shelfDepth / 2]
  ));

  // Frame leans back against the wall with its bottom edge resting on the shelf
  const tilt = THREE.MathUtils.degToRad(7);
  const lean = new THREE.Group();
  framed.position.set(0, outerSize / 2, FRAME_BACK);
  lean.add(framed);
  lean.rotation.x = -tilt;
  const frameX = -shelfWidth / 2 + 10 * CM + outerSize / 2;
  lean.position.set(frameX, 0, outerSize * Math.sin(tilt) + 0.4);
  root.add(lean);

  const decorStart = frameX + outerSize / 2;
  const decorSpace = shelfWidth / 2 - decorStart;
  const books = createBookStack();
  books.position.set(decorStart + decorSpace * 0.38, 0, shelfDepth * 0.5);
  root.add(books);
  const plant = createPlant('#f2ede4');
  plant.position.set(decorStart + decorSpace * 0.78, 0, shelfDepth * 0.5);
  root.add(plant);

  const center = new THREE.Vector3(0, outerSize * 0.42, shelfDepth / 2);
  const radius = Math.hypot(shelfWidth, outerSize + 20 * CM) * 0.5;
  addRoomLights(root, center, radius);

  return {
    root,
    background: '#d9d2c8',
    center,
    radius,
    views: {
      front: new THREE.Vector3(0.12, 0.08, 1),
      angled: new THREE.Vector3(0.6, 0.18, 0.85),
    },
    maxPolarAngle: Math.PI * 0.62,
    azimuthRange: 1.1,
  };
}

function stageWall(mosaic: THREE.Group, size: number): StagedScene {
  const root = new THREE.Group();
  const { framed, outerSize } = createFramedMosaic(mosaic, size);

  const boardWidth = Math.max(160 * CM, outerSize + 50 * CM);
  const legHeight = 14 * CM;
  const bodyHeight = 62 * CM;
  const boardDepth = 42 * CM;
  const boardTop = legHeight + bodyHeight;
  const frameBottom = boardTop + 30 * CM;
  const wallHeight = Math.max(280 * CM, frameBottom + outerSize + 80 * CM);

  root.add(mesh(
    new THREE.PlaneGeometry(boardWidth * 5, wallHeight),
    new THREE.MeshStandardMaterial({ color: '#e4ddd2', roughness: 0.95 }),
    [0, wallHeight / 2, 0],
    false
  ));

  const floorTexture = woodTexture('#9c7350', '#4a2f19', 6, 11);
  floorTexture.repeat.set(4, 4);
  const floor = mesh(
    new THREE.PlaneGeometry(boardWidth * 5, boardWidth * 3),
    new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.55 }),
    [0, 0, boardWidth * 1.5],
    false
  );
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);

  // Sideboard: oak body on slim black legs, with door seams on the front
  const oak = woodTexture('#c49a6c', '#6e4a2a', 0, 5);
  oak.repeat.set(2, 1);
  const oakMaterial = new THREE.MeshStandardMaterial({ map: oak, roughness: 0.6 });
  root.add(mesh(
    new THREE.BoxGeometry(boardWidth, bodyHeight, boardDepth),
    oakMaterial,
    [0, legHeight + bodyHeight / 2, boardDepth / 2]
  ));
  const seamMaterial = new THREE.MeshStandardMaterial({ color: '#3b2a1c', roughness: 0.8 });
  const seamGeometry = new THREE.BoxGeometry(0.35 * CM, bodyHeight * 0.92, 0.2);
  [-1, 0, 1].forEach((i) => {
    root.add(mesh(seamGeometry, seamMaterial, [(i * boardWidth) / 4, legHeight + bodyHeight / 2, boardDepth + 0.05], false));
  });
  const legMaterial = new THREE.MeshStandardMaterial({ color: '#1d1d1d', roughness: 0.4 });
  const legGeometry = new THREE.CylinderGeometry(1.2 * CM, 0.9 * CM, legHeight, 16);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    root.add(mesh(
      legGeometry,
      legMaterial,
      [sx * (boardWidth / 2 - 6 * CM), legHeight / 2, boardDepth / 2 + sz * (boardDepth / 2 - 6 * CM)]
    ));
  }));

  // Table lamp on the left, plant on the right
  const lamp = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: '#b08d57', roughness: 0.35, metalness: 0.6 });
  lamp.add(mesh(new THREE.CylinderGeometry(7 * CM, 8 * CM, 2.5 * CM, 32), brass, [0, 1.25 * CM, 0]));
  lamp.add(mesh(new THREE.CylinderGeometry(0.7 * CM, 0.7 * CM, 34 * CM, 12), brass, [0, 19 * CM, 0]));
  lamp.add(mesh(
    new THREE.CylinderGeometry(10 * CM, 16 * CM, 20 * CM, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: '#f3ebdd', emissive: '#ffdcae', emissiveIntensity: 0.35, roughness: 0.9, side: THREE.DoubleSide,
    }),
    [0, 40 * CM, 0]
  ));
  lamp.position.set(-boardWidth / 2 + 22 * CM, boardTop, boardDepth * 0.45);
  root.add(lamp);

  const plant = createPlant('#3d3a36', 1.15);
  plant.position.set(boardWidth / 2 - 20 * CM, boardTop, boardDepth * 0.45);
  root.add(plant);

  framed.position.set(0, frameBottom + outerSize / 2, FRAME_BACK + 0.2);
  root.add(framed);

  const top = frameBottom + outerSize + 15 * CM;
  const center = new THREE.Vector3(0, top / 2, boardDepth / 2);
  const radius = Math.hypot(boardWidth * 1.1, top) * 0.5;
  addRoomLights(root, center, radius);

  return {
    root,
    background: '#d4ccc0',
    center,
    radius,
    views: {
      front: new THREE.Vector3(0, 0.12, 1),
      angled: new THREE.Vector3(0.55, 0.15, 0.85),
    },
    maxPolarAngle: Math.PI * 0.6,
    azimuthRange: 1.1,
  };
}

export function stageMosaic(kind: SceneKind, mosaic: THREE.Group, size: number): StagedScene {
  if (kind === 'shelf') return stageShelf(mosaic, size);
  if (kind === 'wall') return stageWall(mosaic, size);
  return stageStudio(mosaic, size);
}

/** Free every geometry, material and texture under root */
export function disposeObject(root: THREE.Object3D) {
  const disposed = new Set<{ dispose: () => void }>();
  root.traverse((object) => {
    const m = object as THREE.Mesh;
    if (m.geometry) disposed.add(m.geometry);
    const materials = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    materials.forEach((material) => {
      disposed.add(material);
      const map = (material as THREE.MeshStandardMaterial).map;
      if (map) disposed.add(map);
    });
    if (object instanceof THREE.InstancedMesh) disposed.add(object);
  });
  disposed.forEach((item) => item.dispose());
}
