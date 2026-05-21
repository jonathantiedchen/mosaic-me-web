import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Check } from 'lucide-react';

interface FeedbackWidgetProps {
  sessionId: string;
}

export function FeedbackWidget({ sessionId }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFeedbackClick = (type: 'thumbs_up' | 'thumbs_down') => {
    setSelectedType(type);
    setIsOpen(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          feedback_type: selectedType,
          comment: comment.trim() || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit feedback');
      }
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSelectedType(null);
        setComment('');
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedType(null);
    setComment('');
    setError('');
    setIsSubmitted(false);
  };

  if (!sessionId) return null;

  const thumbStyle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? '#c4a882' : '#2e2a26'}`,
    background: '#242018',
    borderRadius: '2px',
    padding: '8px',
    cursor: 'pointer',
    color: active ? '#c4a882' : '#5a5450',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s, color 0.15s',
  });

  return (
    <>
      {!isOpen && !isSubmitted && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleFeedbackClick('thumbs_up')}
            style={thumbStyle(selectedType === 'thumbs_up')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4a882'; }}
            onMouseLeave={e => { if (selectedType !== 'thumbs_up') (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2a26'; }}
            aria-label="Thumbs up"
          >
            <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => handleFeedbackClick('thumbs_down')}
            style={thumbStyle(selectedType === 'thumbs_down')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4a882'; }}
            onMouseLeave={e => { if (selectedType !== 'thumbs_down') (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2a26'; }}
            aria-label="Thumbs down"
          >
            <ThumbsDown className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)' }}>
          <div className="panel" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p className="font-sans text-text-primary" style={{ fontSize: '14px', fontWeight: 500 }}>
                {selectedType === 'thumbs_up' ? 'Glad you like it!' : 'Help us improve'}
              </p>
              <button onClick={handleClose} className="text-text-muted" style={{ padding: '2px' }}>
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {isSubmitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
                <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '12px' }}>
                  <Check className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <p className="font-sans text-text-subtle" style={{ fontSize: '13px', fontWeight: 300 }}>Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <p className="chip-label" style={{ marginBottom: '8px' }}>
                    Tell us more (optional)
                  </p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value.slice(0, 200))}
                    placeholder="What did you think?"
                    rows={3}
                    maxLength={200}
                    style={{
                      width: '100%',
                      border: '1px solid #2e2a26',
                      borderRadius: '2px',
                      background: '#1c1917',
                      color: '#f5f0e8',
                      fontSize: '13px',
                      fontWeight: 300,
                      padding: '10px 12px',
                      resize: 'none',
                      outline: 'none',
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  />
                  <p className="font-sans text-text-muted" style={{ fontSize: '10px', fontWeight: 300, marginTop: '4px' }}>
                    {comment.length}/200
                  </p>
                </div>

                {error && (
                  <p className="text-error-light" style={{ fontSize: '12px', marginBottom: '12px' }}>{error}</p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleClose} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-generate flex-1"
                  >
                    {isSubmitting ? 'Sending…' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
