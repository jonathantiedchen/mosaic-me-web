import { useState } from 'react';
import type { FeedbackStats, RecentFeedbackItem } from '../../services/feedback';
import { FeedbackList } from './FeedbackList';

type Filter = 'all' | 'thumbs_up' | 'thumbs_down' | 'comments';

interface FeedbackOverviewProps {
  stats: FeedbackStats | null;
  feedback: RecentFeedbackItem[];
  days: number;
  /** How many items were requested; hitting it means older ones were cut off */
  limit: number;
}

/** Satisfaction summary and a filterable list of every rating and suggestion */
export function FeedbackOverview({ stats, feedback, days, limit }: FeedbackOverviewProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const total = stats?.total ?? 0;
  const up = stats?.thumbs_up ?? 0;
  const down = stats?.thumbs_down ?? 0;
  const upShare = total > 0 ? (up / total) * 100 : 0;

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: total },
    { id: 'thumbs_up', label: 'Thumbs up', count: up },
    { id: 'thumbs_down', label: 'Thumbs down', count: down },
    { id: 'comments', label: 'With suggestions', count: stats?.with_comment ?? 0 },
  ];

  const visible = feedback.filter(item =>
    filter === 'all' ? true
      : filter === 'comments' ? !!item.comment
      : item.feedback_type === filter
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <div className="panel p-5">
          <p className="chip-label">Satisfaction</p>
          <p className="font-serif text-text-primary mt-1" style={{ fontSize: '36px', lineHeight: 1.1 }}>
            {total > 0 ? `${stats?.satisfaction_rate}%` : '—'}
          </p>
          <div
            className="mt-4 h-2 w-full rounded-sm overflow-hidden flex bg-border"
            role="img"
            aria-label={`${up} thumbs up, ${down} thumbs down`}
          >
            {total > 0 && (
              <>
                <div className="bg-green-500/70" style={{ width: `${upShare}%` }} />
                <div className="bg-red-500/60" style={{ width: `${100 - upShare}%` }} />
              </>
            )}
          </div>
          <p className="text-xs text-text-muted mt-2">
            {total > 0
              ? `${up} up · ${down} down · last ${days} days`
              : `No ratings in the last ${days} days`}
          </p>
        </div>
        <div className="panel p-5">
          <p className="chip-label">Responses</p>
          <p className="font-serif text-text-primary mt-1" style={{ fontSize: '36px', lineHeight: 1.1 }}>
            {total.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted mt-2">Last {days} days</p>
        </div>
        <div className="panel p-5">
          <p className="chip-label">Suggestions</p>
          <p className="font-serif text-text-primary mt-1" style={{ fontSize: '36px', lineHeight: 1.1 }}>
            {(stats?.with_comment ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-text-muted mt-2">Ratings with a written comment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter feedback">
        {filters.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={`border rounded-sm px-3 py-1.5 text-sm transition-colors ${
              filter === id
                ? 'border-accent text-text-primary'
                : 'border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {label} <span className="text-text-muted">{count}</span>
          </button>
        ))}
      </div>

      <FeedbackList
        feedback={visible}
        emptyText={total === 0 ? `No feedback in the last ${days} days` : 'Nothing matches this filter'}
      />

      {feedback.length >= limit && (
        <p className="text-xs text-text-muted">
          Showing the latest {limit} responses; the counts above cover the whole period.
        </p>
      )}
    </div>
  );
}
