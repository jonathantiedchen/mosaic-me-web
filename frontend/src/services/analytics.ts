const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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

class AnalyticsService {
  private getAuthHeader(): string {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return `Bearer ${token}`;
  }

  async getMetrics(days: number = 30): Promise<AnalyticsMetrics> {
    const response = await fetch(
      `${API_BASE_URL}/analytics/metrics?days=${days}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analytics metrics');
    }

    return response.json();
  }

  async getSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsSummary[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());

    const response = await fetch(
      `${API_BASE_URL}/analytics/summary?${params}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analytics summary');
    }

    return response.json();
  }

  async getPopularBaseplates(
    days: number = 30,
    limit: number = 5
  ): Promise<PopularBaseplateSize[]> {
    const response = await fetch(
      `${API_BASE_URL}/analytics/popular-sizes?days=${days}&limit=${limit}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch popular baseplate sizes');
    }

    return response.json();
  }

  async exportCSV(startDate?: Date, endDate?: Date): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());

    const response = await fetch(
      `${API_BASE_URL}/analytics/export?${params}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export analytics data');
    }

    return response.blob();
  }

  async refreshSummaryView(): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/analytics/refresh`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to refresh analytics view');
    }
  }
}

export const analyticsService = new AnalyticsService();
