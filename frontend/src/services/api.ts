import type {
  ApiResponse,
  UploadResponse,
  ColorPalette,
  ExportType,
  MosaicConfig,
  MosaicData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
    formData.append('file', file);
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
