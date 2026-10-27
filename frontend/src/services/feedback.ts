const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface FeedbackStats {
  thumbs_up: number;
  thumbs_down: number;
  total: number;
  with_comment: number;
  satisfaction_rate: number;
  period_days: number;
}

export type FeedbackType = 'thumbs_up' | 'thumbs_down';

export const FEEDBACK_COMMENT_MAX_LENGTH = 1000;

export interface RecentFeedbackItem {
  id: number;
  session_id: string | null;
  feedback_type: string;
  comment: string | null;
  created_at: string;
}

class FeedbackService {
  /** Public: no login needed. Leave sessionId out for general feedback. */
  async submit(feedbackType: FeedbackType, comment: string, sessionId?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId || null,
        feedback_type: feedbackType,
        comment: comment.trim() || null,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to submit feedback');
    }
  }

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
    commentsOnly: boolean = false,
    days?: number
  ): Promise<RecentFeedbackItem[]> {
    const params = new URLSearchParams({ limit: String(limit), comments_only: String(commentsOnly) });
    if (days) params.set('days', String(days));
    const response = await fetch(
      `${API_BASE_URL}/feedback/recent?${params}`,
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
