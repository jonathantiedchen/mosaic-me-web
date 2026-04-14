const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface FeedbackStats {
  thumbs_up: number;
  thumbs_down: number;
  total: number;
  satisfaction_rate: number;
  period_days: number;
}

export interface RecentFeedbackItem {
  id: number;
  session_id: string;
  feedback_type: string;
  comment: string | null;
  created_at: string;
}

class FeedbackService {
  private getAuthHeader(): string {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return `Bearer ${token}`;
  }

  async getStats(days: number = 30): Promise<FeedbackStats> {
    const response = await fetch(
      `${API_BASE_URL}/feedback/stats?days=${days}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch feedback stats');
    }

    return response.json();
  }

  async getRecent(
    limit: number = 20,
    commentsOnly: boolean = false
  ): Promise<RecentFeedbackItem[]> {
    const response = await fetch(
      `${API_BASE_URL}/feedback/recent?limit=${limit}&comments_only=${commentsOnly}`,
      {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent feedback');
    }

    return response.json();
  }
}

export const feedbackService = new FeedbackService();
