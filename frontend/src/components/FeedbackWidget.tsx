import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Check } from 'lucide-react';

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
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Don't render if no session
  if (!sessionId) return null;

  return (
    <>
      {/* Fixed position feedback buttons - bottom right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
        {!isOpen && !isSubmitted && (
          <>
            <button
              onClick={() => handleFeedbackClick('thumbs_up')}
              className="group flex items-center gap-2 px-4 py-3 glass-card hover:bg-white/10 text-white rounded-full transition-all hover:scale-105 shadow-lg"
              title="I like this!"
            >
              <ThumbsUp className="w-5 h-5 text-green-400 group-hover:text-green-300" />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap">
                Like it!
              </span>
            </button>
            <button
              onClick={() => handleFeedbackClick('thumbs_down')}
              className="group flex items-center gap-2 px-4 py-3 glass-card hover:bg-white/10 text-white rounded-full transition-all hover:scale-105 shadow-lg"
              title="Could be better"
            >
              <ThumbsDown className="w-5 h-5 text-red-400 group-hover:text-red-300" />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap">
                Not great
              </span>
            </button>
          </>
        )}
      </div>

      {/* Feedback form modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card border-purple-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedType === 'thumbs_up' ? (
                  <ThumbsUp className="w-6 h-6 text-green-400" />
                ) : (
                  <ThumbsDown className="w-6 h-6 text-red-400" />
                )}
                <h3 className="text-lg font-bold text-white">
                  {selectedType === 'thumbs_up' ? 'Glad you like it!' : 'Help us improve'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-purple-300" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-lg font-medium text-white">Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Tell us more (optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 200))}
                    placeholder="What did you think? Any suggestions?"
                    className="w-full px-4 py-3 glass-card border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-purple-300/70">
                      {comment.length}/200 characters
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 glass-card hover:bg-white/10 text-purple-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
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
