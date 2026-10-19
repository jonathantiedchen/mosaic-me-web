import type {
  ApiResponse,
  UploadResponse,
  ColorPalette,
  ExportType,
  MosaicConfig,
  MosaicData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// A mosaic is at most 128 studs wide, so 2048px loses nothing, and it keeps
// uploads well under the hosting platform's 4.5 MB request limit.
const UPLOAD_MAX_DIMENSION = 2048;

async function shrinkForUpload(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // Let the server report unreadable images
  }

  const scale = Math.min(1, UPLOAD_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= 3 * 1024 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }
  // Transparent areas would otherwise turn black in the JPEG
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      }));
      // FastAPI wraps our error payload in "detail"; 422 validation errors use a list there
      const detail = error.detail;
      throw new Error((detail && !Array.isArray(detail) && detail.message) || error.message || 'Request failed');
    }

    return response.json();
  }

  async uploadImage(
    file: File,
    config: MosaicConfig
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', await shrinkForUpload(file));
    formData.append('baseplateSize', config.baseplateSize.toString());
    formData.append('pieceType', config.pieceType);

    const response = await this.request<ApiResponse<UploadResponse>>(
      '/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Upload failed');
    }

    return response.data;
  }

  async getPalettes(): Promise<ColorPalette[]> {
    const response = await this.request<ApiResponse<{ palettes: ColorPalette[] }>>(
      '/palettes'
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch palettes');
    }

    return response.data.palettes;
  }

  async getPaletteColors(paletteType: 'round' | 'square'): Promise<ColorPalette> {
    const response = await this.request<ApiResponse<{ palette: ColorPalette }>>(
      `/palettes/${paletteType}/colors`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch palette colors');
    }

    return response.data.palette;
  }

  async exportFile(
    mosaic: MosaicData,
    exportType: ExportType
  ): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/${exportType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: mosaic.sessionId,
        pieceType: mosaic.metadata.pieceType,
        grid: mosaic.grid.map(row => row.map(cell => cell.colorId)),
      }),
    });

    if (!response.ok) {
      // FastAPI wraps our error payload in "detail"
      const body = await response.json().catch(() => null);
      throw new Error(body?.detail?.message || 'Download failed. Please try again.');
    }

    return response.blob();
  }

  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
