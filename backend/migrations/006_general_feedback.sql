-- Migration 006: General feedback and longer suggestions
--
-- Feedback can now be left from anywhere in the app, not only after
-- generating a mosaic, so session_id becomes optional. Comments double as a
-- suggestions box and get room for more than a one-liner.
--
-- Only relaxes constraints, so it is safe to run before the code that uses it.

ALTER TABLE user_feedback ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS chk_comment_length;
ALTER TABLE user_feedback
    ADD CONSTRAINT chk_comment_length CHECK (char_length(comment) <= 1000);

COMMENT ON COLUMN user_feedback.session_id IS 'UUID of the mosaic session this feedback is for; NULL for general feedback';
COMMENT ON COLUMN user_feedback.comment IS 'Optional suggestion or comment (max 1000 characters)';

-- The unique index on (session_id, visitor_hash) still allows one rating per
-- mosaic; NULL session_ids never collide, so general feedback is not limited.

-- To run this migration:
-- psql $DATABASE_URL -f backend/migrations/006_general_feedback.sql
