-- Migration 005: Supabase hardening and scheduled cleanup
--
-- Supabase publishes the public schema through its Data API, which anyone
-- holding the project's public (anon) key can call. This app never uses that
-- API: the backend connects as the table owner, which bypasses RLS. So we
-- lock the Data API out completely: RLS on with no policies, and no grants
-- for the API roles on tables, views or functions.

-- ============================================
-- Row Level Security (no policies = no API access)
-- ============================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Revoke Data API access
-- ============================================

-- Materialized views cannot have RLS, so revoking is the only protection
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
-- Functions are callable over the API as RPC (e.g. cleanup_old_analytics)
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Objects created later by the owner get the same treatment
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- ============================================
-- Scheduled cleanup (replaces the cleanup the server ran at startup)
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- GDPR: keep analytics events for 90 days
SELECT cron.schedule('cleanup-old-analytics', '17 3 * * *', $$SELECT cleanup_old_analytics(90)$$);
SELECT cron.schedule('cleanup-expired-refresh-tokens', '27 3 * * *', $$SELECT cleanup_expired_refresh_tokens()$$);
SELECT cron.schedule('delete-expired-sessions', '37 3 * * *', $$SELECT delete_expired_sessions()$$);
