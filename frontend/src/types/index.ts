export interface LegoColor {
  id: string;
  name: string;
  rgb: [number, number, number];
  hex: string;
  legoId?: string;
  pickABrickAvailable: boolean;
}

export interface ColorPalette {
  id: string;
  name: string;
  type: 'round' | 'square';
  colors: LegoColor[];
  colorCount: number;
}

export interface MosaicGridCell {
  colorId: string;
  colorName: string;
  rgb: [number, number, number];
  hex: string;
}

export interface ShoppingListItem {
  colorId: string;
  colorName: string;
  quantity: number;
  rgb: [number, number, number];
  hex: string;
}

export interface MosaicMetadata {
  baseplateSize: number;
  pieceType: 'round' | 'square';
  totalPieces: number;
  uniqueColors: number;
  createdAt: string;
}

export interface MosaicData {
  sessionId: string;
  previewUrl: string;
  grid: MosaicGridCell[][];
  shoppingList: ShoppingListItem[];
  metadata: MosaicMetadata;
}

export interface MosaicConfig {
  baseplateSize: 32 | 48 | 64 | 96 | 128;
  pieceType: 'round' | 'square';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface UploadResponse {
  sessionId: string;
  mosaic: MosaicData;
}

export type ExportType = 'mosaic-png' | 'instructions-png' | 'shopping-csv';
