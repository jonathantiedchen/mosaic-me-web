import type {
  ApiResponse,
  UploadResponse,
  ColorPalette,
  ExportType,
  MosaicConfig,
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
      throw new Error(error.message || 'Request failed');
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

  async exportFile(
    sessionId: string,
    exportType: ExportType
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/export/${sessionId}/${exportType}`
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
