-- Migration 007: Retention for user feedback
--
-- GDPR storage limitation: feedback comments are free text and may contain
-- personal data, so like analytics events they must not be kept forever.
-- Feedback older than 365 days is deleted daily by pg_cron (see migration 005
-- for the other cleanup jobs). The privacy policy states this period; change
-- both together.

CREATE OR REPLACE FUNCTION cleanup_old_feedback(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_feedback
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Same lock-down as migration 005: not callable through the Supabase Data API
REVOKE EXECUTE ON FUNCTION cleanup_old_feedback(integer) FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('cleanup-old-feedback', '47 3 * * *', $$SELECT cleanup_old_feedback(365)$$);

-- To run this migration:
-- psql $DATABASE_URL -f backend/migrations/007_feedback_retention.sql
