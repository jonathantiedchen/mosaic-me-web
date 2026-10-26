import { useEffect, useState, type ReactNode } from 'react';
import { ThumbsUp, ThumbsDown, X, Check, MessageSquare } from 'lucide-react';
import { feedbackService, FEEDBACK_COMMENT_MAX_LENGTH, type FeedbackType } from '../services/feedback';

interface FeedbackFormProps {
  /** Ties the feedback to a generated mosaic; omit for general feedback */
  sessionId?: string;
  title: string;
  onSubmitted?: () => void;
}

/** Thumbs up or down, plus an optional box for suggestions */
export function FeedbackForm({ sessionId, title, onSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState<FeedbackType | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);
    setError('');
    try {
      await feedbackService.submit(rating, comment, sessionId);
      setIsSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div role="status" className="flex flex-col items-center gap-3" style={{ padding: '16px 0' }}>
        <div className="border border-border" style={{ borderRadius: '2px', padding: '10px' }}>
          <Check className="w-5 h-5 text-accent" strokeWidth={1.5} />
        </div>
        <p className="font-sans text-text-subtle" style={{ fontSize: '13px' }}>Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="chip-label" style={{ marginBottom: 0 }}>{title}</p>

      <div className="flex gap-2" role="group" aria-label="Rating">
        <RatingButton
          label="Thumbs up"
          selected={rating === 'thumbs_up'}
          onClick={() => setRating('thumbs_up')}
          icon={<ThumbsUp className="w-4 h-4" strokeWidth={1.5} />}
        />
        <RatingButton
          label="Thumbs down"
          selected={rating === 'thumbs_down'}
          onClick={() => setRating('thumbs_down')}
          icon={<ThumbsDown className="w-4 h-4" strokeWidth={1.5} />}
        />
      </div>

      <div>
        <label htmlFor={`feedback-comment-${sessionId ?? 'general'}`} className="chip-label block" style={{ marginBottom: '6px' }}>
          Suggestions or feedback (optional)
        </label>
        <textarea
          id={`feedback-comment-${sessionId ?? 'general'}`}
          value={comment}
          onChange={e => setComment(e.target.value.slice(0, FEEDBACK_COMMENT_MAX_LENGTH))}
          placeholder={rating === 'thumbs_down' ? 'What went wrong, or what should we change?' : 'What do you like, or what would make it better?'}
          rows={4}
          maxLength={FEEDBACK_COMMENT_MAX_LENGTH}
          className="font-sans bg-surface text-text-primary border border-border focus:border-accent"
          style={{
            width: '100%',
            borderRadius: '2px',
            fontSize: '13px',
            padding: '10px 12px',
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <p className="font-sans text-text-muted text-right" style={{ fontSize: '11px', marginTop: '2px' }}>
          {comment.length}/{FEEDBACK_COMMENT_MAX_LENGTH}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-error-light" style={{ fontSize: '12px' }}>{error}</p>
      )}

      <button onClick={handleSubmit} disabled={!rating || isSubmitting} className="btn-generate">
        {isSubmitting ? 'Sending…' : rating ? 'Send feedback' : 'Pick thumbs up or down'}
      </button>
    </div>
  );
}

function RatingButton({ label, selected, onClick, icon }: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={`flex-1 border bg-surface flex items-center justify-center transition-colors hover:border-accent ${
        selected ? 'border-accent text-accent' : 'border-border text-text-secondary'
      }`}
      style={{ borderRadius: 2, padding: 10 }}
    >
      {icon}
    </button>
  );
}

/** Nav button that opens the feedback form in a dialog, available on every page */
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        style={{ fontSize: '12px' }}
      >
        <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
        Feedback
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            onClick={e => e.stopPropagation()}
            className="panel relative"
            style={{ maxWidth: '420px', width: '100%', padding: '24px' }}
          >
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="absolute text-text-muted hover:text-text-primary"
              style={{ top: '18px', right: '18px', padding: '2px' }}
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <FeedbackForm
              title="What do you think of Mosaic Me?"
              onSubmitted={() => setTimeout(() => setIsOpen(false), 2000)}
            />
          </div>
        </div>
      )}
    </>
  );
}
