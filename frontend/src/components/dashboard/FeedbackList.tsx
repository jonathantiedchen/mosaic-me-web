import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { RecentFeedbackItem } from '../../services/feedback';

interface FeedbackListProps {
  feedback: RecentFeedbackItem[];
  emptyText?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function FeedbackList({ feedback, emptyText = 'No feedback yet' }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-text-secondary">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="panel divide-y divide-border">
      {feedback.map((item) => {
        const positive = item.feedback_type === 'thumbs_up';
        return (
          <li key={item.id} className="p-4 flex items-start gap-3">
            <div
              className={`flex-shrink-0 border rounded-sm p-2 ${
                positive ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'
              }`}
              title={positive ? 'Thumbs up' : 'Thumbs down'}
            >
              {positive ? (
                <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <ThumbsDown className="w-4 h-4" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="chip-label" style={{ marginBottom: 0 }}>
                  {item.session_id ? 'After generating a mosaic' : 'General feedback'}
                </span>
                <time
                  dateTime={item.created_at}
                  title={new Date(item.created_at).toLocaleString()}
                  className="text-xs text-text-muted flex-shrink-0"
                >
                  {formatDate(item.created_at)}
                </time>
              </div>
              {item.comment ? (
                <p className="text-sm text-text-subtle mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                  {item.comment}
                </p>
              ) : (
                <p className="text-xs text-text-muted italic mt-1.5">Rating only, no comment</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
