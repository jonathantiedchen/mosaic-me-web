-- Migration: User Feedback System
-- Description: Add table for user feedback with thumbs up/down and optional comments
-- Created: 2026-04-14

-- ============================================
-- User Feedback Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    visitor_hash VARCHAR(64) NOT NULL,
    feedback_type VARCHAR(10) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- Constraints
-- ============================================

-- Ensure feedback_type is either thumbs_up or thumbs_down
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_feedback_type'
        AND conrelid = 'user_feedback'::regclass
    ) THEN
        ALTER TABLE user_feedback
        ADD CONSTRAINT chk_feedback_type
        CHECK (feedback_type IN ('thumbs_up', 'thumbs_down'));
    END IF;
END $$;

-- Ensure comment length is <= 200 characters
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_comment_length'
        AND conrelid = 'user_feedback'::regclass
    ) THEN
        ALTER TABLE user_feedback
        ADD CONSTRAINT chk_comment_length
        CHECK (char_length(comment) <= 200);
    END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================

-- Index for querying recent feedback (DESC for newest first)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON user_feedback(created_at DESC);

-- Index for querying feedback by session
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON user_feedback(session_id);

-- Index for querying feedback by visitor
CREATE INDEX IF NOT EXISTS idx_feedback_visitor_hash ON user_feedback(visitor_hash);

-- Index for filtering by feedback type
CREATE INDEX IF NOT EXISTS idx_feedback_type ON user_feedback(feedback_type);

-- Unique index to prevent duplicate feedback per session/visitor
CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_unique_session
    ON user_feedback(session_id, visitor_hash);

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE user_feedback IS 'User feedback for mosaic generation with thumbs up/down ratings';
COMMENT ON COLUMN user_feedback.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN user_feedback.session_id IS 'UUID of the mosaic session this feedback is for';
COMMENT ON COLUMN user_feedback.visitor_hash IS 'Privacy-preserving visitor identifier (same as analytics_events)';
COMMENT ON COLUMN user_feedback.feedback_type IS 'Type of feedback: thumbs_up or thumbs_down';
COMMENT ON COLUMN user_feedback.comment IS 'Optional user comment (max 200 characters)';
COMMENT ON COLUMN user_feedback.created_at IS 'Timestamp when feedback was submitted';

-- ============================================
-- Migration Complete
-- ============================================

-- To run this migration:
-- psql $DATABASE_URL -f backend/migrations/004_user_feedback.sql

-- To verify:
-- psql $DATABASE_URL -c "\d user_feedback"
