import * as THREE from 'three';
import type { MosaicGridCell } from '../types';
import { createMosaic, disposeObject } from './mosaicScenes';

const STUD_CM = 0.8;
const FRAME_BORDER_CM = 2.5;

type Point = [number, number];

export interface PhotoScene {
  id: string;
  label: string;
  src: string;
  credit: { name: string; url: string };
  /**
   * Four wall-plane points in cm (x along the wall, y up) and where they appear in the photo (px).
   * Calibrated from objects of known size; defines the photo's perspective and true scale.
   */
  wall: { cm: [Point, Point, Point, Point]; px: [Point, Point, Point, Point] };
  /** Where the framed mosaic goes on the wall (cm), given its outer size (cm) */
  place: (frameCm: number) => { left: number; bottom: number };
  /** Largest framed size (cm) that fits the scene believably */
  maxFrameCm: number;
  /** Direction light travels in, in wall cm (x right, y up); the mosaic's shadow falls this way */
  light: Point;
  /** Multiplier so the mosaic's whites sit at the photo's exposure and colour temperature */
  tint: string;
  /** The photo already contains a real shadow where the mosaic stands, below this wall height (cm) */
  realShadowBelowCm?: number;
}

/** Straight-on photos: the wall is a plain scale + offset (floor line at floorY px) */
function frontal(pxPerCm: number, floorY: number, originX = 0): PhotoScene['wall'] {
  const at = (x: number, y: number): Point => [originX + x * pxPerCm, floorY - y * pxPerCm];
  return { cm: [[0, 0], [100, 0], [100, 100], [0, 100]], px: [at(0, 0), at(100, 0), at(100, 100), at(0, 100)] };
}

export const PHOTO_SCENES: PhotoScene[] = [
  {
    // Scale from the door opening (~205 cm = 1000 px); sofa (~153 cm) and dresser (~109 cm) agree
    id: 'living-room',
    label: 'Living room',
    src: '/mockups/living-room.jpg',
    credit: { name: 'Alexandra Gorn', url: 'https://unsplash.com/photos/JIUjvqe2ZHg' },
    wall: frontal(4.9, 1444),
    place: (frame) => ({ left: 208 - frame / 2, bottom: 90 }), // centred over the sofa, ~22 cm above its back
    maxFrameCm: 140,
    light: [1, -0.35],
    tint: '#e6e8ea',
  },
  {
    // Scale from the skirting board and plant pot; art centred at gallery height (~150 cm)
    id: 'beige-wall',
    label: 'Beige wall',
    src: '/mockups/beige-wall.jpg',
    credit: { name: 'mk. s', url: 'https://unsplash.com/photos/XaFEE8t2pKg' },
    wall: frontal(6.7, 1594),
    place: (frame) => ({ left: 199 - frame / 2, bottom: Math.max(60, 150 - frame / 2) }),
    maxFrameCm: 140,
    light: [-0.8, -0.45],
    tint: '#f3e6da',
  },
  {
    // Wall recedes to the right (vanishing point x≈4889, camera ~60 cm high); 10 cm skirting gives 11 px/cm at x=0
    id: 'leaning',
    label: 'Leaning by the sofa',
    src: '/mockups/sofa-white-wall.jpg',
    credit: { name: 'Katsia Jazwinska', url: 'https://unsplash.com/photos/RIb19_YSUX0' },
    wall: {
      cm: [[0, 0], [140, 0], [140, 140], [0, 140]],
      px: [[0, 1495], [1210.4, 1331.6], [1210.4, 172.9], [0, -45]],
    },
    place: (frame) => ({ left: 70 - frame / 2, bottom: 0 }),
    maxFrameCm: 115,
    light: [1, -0.25],
    tint: '#eef0f2',
  },
  {
    // IKEA-style 55 cm picture ledge (1668 px ≈ 30.3 px/cm), lengthened by 15 cm in the retouch.
    // The mosaic's right edge sits where the removed print's was, so the photo's real shadow is its own.
    id: 'shelf',
    label: 'Picture ledge',
    src: '/mockups/shelf.jpg',
    credit: { name: 'Alexander von Schulz', url: 'https://unsplash.com/photos/Gx_eYTapLsE' },
    wall: frontal(30.3, 1577),
    place: (frame) => ({ left: (1816 / 30.3) - frame, bottom: 0 }),
    maxFrameCm: 50,
    light: [1, -0.2],
    tint: '#eceeef',
    realShadowBelowCm: (1577 - 924) / 30.3,
  },
];

/** Homography mapping 4 source points onto 4 destination points (3x3, row-major) */
function homography(src: Point[], dst: Point[]): number[] {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  // Gauss-Jordan elimination on the 8x9 augmented matrix
  for (let c = 0; c < 8; c++) {
    let pivot = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[pivot][c])) pivot = r;
    [A[c], A[pivot]] = [A[pivot], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const k = A[r][c] / A[c][c];
      for (let j = c; j < 9; j++) A[r][j] -= k * A[c][j];
    }
  }
  const h = A.map((row, i) => row[8] / row[i]);
  return [...h, 1];
}

function project(h: number[], [x, y]: Point): Point {
  const w = h[6] * x + h[7] * y + h[8];
  return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w];
}

export function frameSizeCm(gridSize: number): number {
  return gridSize * STUD_CM + FRAME_BORDER_CM * 2;
}

export function fitsScene(scene: PhotoScene, gridSize: number): boolean {
  return frameSizeCm(gridSize) <= scene.maxFrameCm;
}

/**
 * Render the framed mosaic face-on as an image: real studs lit from the photo's light direction,
 * in a black frame whose lip shades the mosaic edge facing away from the light.
 */
function renderFramedTexture(
  renderer: THREE.WebGLRenderer,
  grid: MosaicGridCell[][],
  pieceType: 'round' | 'square',
  pxPerStud: number,
  light: Point,
  tint: string
): HTMLCanvasElement {
  const size = grid.length;
  const mosaicPx = size * pxPerStud;
  renderer.setSize(mosaicPx, mosaicPx, false);

  const scene = new THREE.Scene();
  scene.add(createMosaic(grid, pieceType));
  // Flat mosaic: image x = +x, image up = -z. Light comes from opposite the direction it travels.
  const [lx, ly] = light;
  const sun = new THREE.DirectionalLight('#ffffff', 2.1);
  sun.position.set(-lx * size, size * 1.1, ly * size);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 0.1, far: size * 4 });
  scene.add(sun, new THREE.HemisphereLight('#ffffff', '#555555', 1.5));

  const half = size / 2;
  const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 50);
  camera.position.set(0, 10, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  disposeObject(scene);

  const border = Math.round((FRAME_BORDER_CM / STUD_CM) * pxPerStud);
  const out = document.createElement('canvas');
  out.width = out.height = mosaicPx + border * 2;
  const ctx = out.getContext('2d')!;

  // Frame face with a soft bevel: lit edges slightly lighter
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, out.width, out.height);
  const bevel = Math.max(1, border * 0.12);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, 0, out.width, bevel);
  ctx.fillRect(0, 0, bevel, out.height);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, out.height - bevel, out.width, bevel);
  ctx.fillRect(out.width - bevel, 0, bevel, out.height);

  ctx.drawImage(renderer.domElement, border, border, mosaicPx, mosaicPx);

  // Lift the mosaic to the photo's exposure / colour temperature
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = tint;
  ctx.fillRect(border, border, mosaicPx, mosaicPx);
  ctx.globalCompositeOperation = 'source-over';

  // The frame lip shades the mosaic along the edges the light can't reach
  const lip = pxPerStud * 1.2;
  const shade = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(rx, ry, rw, rh);
  };
  const inner = border;
  if (lx > 0) shade(inner, 0, inner + lip, 0, inner, inner, lip, mosaicPx); // light from left: left edge shaded
  else shade(inner + mosaicPx, 0, inner + mosaicPx - lip, 0, inner + mosaicPx - lip, inner, lip, mosaicPx);
  if (ly < 0) shade(0, inner, 0, inner + lip, inner, inner, mosaicPx, lip); // light from above: top edge shaded
  return out;
}

/** Composite the mosaic into the photo at true scale. Returns a canvas at the photo's full resolution. */
export function renderPhotoMockup(
  scene: PhotoScene,
  photo: HTMLImageElement,
  grid: MosaicGridCell[][],
  pieceType: 'round' | 'square'
): HTMLCanvasElement {
  const W = photo.naturalWidth;
  const H = photo.naturalHeight;
  const toPx = homography(scene.wall.cm, scene.wall.px);
  const frame = frameSizeCm(grid.length);
  const { left, bottom } = scene.place(frame);
  const cornersCm: Point[] = [[left, bottom + frame], [left + frame, bottom + frame], [left + frame, bottom], [left, bottom]];
  const corners = cornersCm.map((p) => project(toPx, p));

  // Pixels per stud where the mosaic appears, to render the texture at about display resolution
  const widthPx = Math.hypot(corners[1][0] - corners[0][0], corners[1][1] - corners[0][1]);
  const pxPerStud = Math.min(32, Math.max(6, Math.ceil((widthPx / frame) * STUD_CM * 1.25)));

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(photo, 0, 0, W, H);

  // Shadow: the frame's outline pushed along the light direction, blurred; plus a tight contact shadow
  const [lx, ly] = scene.light;
  const shadowPoly = (offsetCm: number): Point[] =>
    cornersCm.map(([x, y]) => project(toPx, [x + lx * offsetCm, y + ly * offsetCm]));
  const pxPerCm = widthPx / frame;
  const drawShadow = (offsetCm: number, blurCm: number, alpha: number) => {
    const poly = shadowPoly(offsetCm);
    ctx.save();
    if (scene.realShadowBelowCm !== undefined) {
      // The photo already has a real shadow lower down; only add ours above it
      const [, clipY] = project(toPx, [left, scene.realShadowBelowCm]);
      ctx.beginPath();
      ctx.rect(0, 0, W, clipY);
      ctx.clip();
    }
    // Draw the polygon far off-canvas and let only its blurred shadow land in place
    const far = W * 3;
    ctx.shadowColor = `rgba(20, 16, 12, ${alpha})`;
    ctx.shadowBlur = blurCm * pxPerCm;
    ctx.shadowOffsetX = far;
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x - far, y) : ctx.lineTo(x - far, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  drawShadow(2.5, 5, 0.42);
  drawShadow(0.5, 1, 0.55);

  // Mosaic: render face-on, then warp onto the wall through the homography in WebGL
  const glCanvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  try {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const texCanvas = renderFramedTexture(renderer, grid, pieceType, pxPerStud, scene.light, scene.tint);

    renderer.shadowMap.enabled = false;
    renderer.setSize(W, H, false);
    const texture = new THREE.CanvasTexture(texCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Subdivided quad whose vertices follow the homography: per-cell affine interpolation is visually exact
    const segments = 24;
    const geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      const [x, y] = project(toPx, [left + u * frame, bottom + v * frame]);
      pos.setXYZ(i, x, H - y, 0);
    }
    const quad = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
    const warpScene = new THREE.Scene();
    warpScene.add(quad);
    const camera = new THREE.OrthographicCamera(0, W, H, 0, -1, 1);
    renderer.setClearColor(0x000000, 0);
    renderer.render(warpScene, camera);
    ctx.drawImage(glCanvas, 0, 0, W, H);

    texture.dispose();
    disposeObject(warpScene);
  } finally {
    renderer.dispose();
    renderer.forceContextLoss();
  }

  // Match the photo's grain over the mosaic so it doesn't look pasted on
  const grain = document.createElement('canvas');
  grain.width = grain.height = 256;
  const g = grain.getContext('2d')!;
  const noise = g.createImageData(256, 256);
  for (let i = 0; i < noise.data.length; i += 4) {
    const n = 128 + (Math.random() - 0.5) * 60;
    noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = n;
    noise.data[i + 3] = 255;
  }
  g.putImageData(noise, 0, 0);
  ctx.save();
  ctx.beginPath();
  corners.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = 0.06;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grain, 'repeat')!;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  return out;
}
