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

// Admin and Authentication Types
export interface Admin {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Analytics Types
export interface AnalyticsMetrics {
  unique_visitors: number;
  mosaics_created: number;
  downloads: {
    mosaic_png: number;
    instructions_png: number;
    shopping_csv: number;
    total: number;
  };
  period_days: number;
}

export interface AnalyticsSummary {
  date: string;
  unique_visitors: number;
  mosaics_created: number;
  mosaic_downloads: number;
  instruction_downloads: number;
  csv_downloads: number;
  total_downloads: number;
}

export interface PopularBaseplateSize {
  baseplate_size: number;
  count: number;
}

// Mosaic Editor Types
export type EditorTool = 'brush' | 'fill';

export interface CellPosition {
  row: number;
  col: number;
}
