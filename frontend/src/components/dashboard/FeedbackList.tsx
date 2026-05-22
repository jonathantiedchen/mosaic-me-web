import { ThumbsUp, ThumbsDown, MessageSquare, Calendar } from 'lucide-react';
import { RecentFeedbackItem } from '../../services/feedback';

interface FeedbackListProps {
  feedback: RecentFeedbackItem[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (feedback.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <MessageSquare className="w-12 h-12 text-text-muted/50 mx-auto mb-3" />
        <p className="text-text-secondary">No feedback yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.map((item) => (
        <div key={item.id} className="panel p-4 hover:border-accent/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-sm ${
              item.feedback_type === 'thumbs_up'
                ? 'bg-green-500/10'
                : 'bg-red-500/10'
            }`}>
              {item.feedback_type === 'thumbs_up' ? (
                <ThumbsUp className="w-5 h-5 text-green-400" />
              ) : (
                <ThumbsDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-sm font-medium ${
                  item.feedback_type === 'thumbs_up'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {item.feedback_type === 'thumbs_up' ? 'Positive' : 'Negative'}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(item.created_at)}
                </span>
              </div>
              {item.comment && (
                <p className="text-sm text-text-subtle mt-2 leading-relaxed">
                  "{item.comment}"
                </p>
              )}
              {!item.comment && (
                <p className="text-xs text-text-muted italic mt-1">
                  No comment provided
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
