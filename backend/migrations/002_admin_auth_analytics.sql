-- Migration: Admin Authentication & Analytics
-- Description: Add tables for admin users, JWT refresh tokens, and update analytics tracking
-- Created: 2025-12-20

-- ============================================
-- Admin Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Refresh Tokens Table
-- ============================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin_id ON refresh_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked) WHERE is_revoked = FALSE;

-- ============================================
-- Update Analytics Events Table
-- ============================================

-- Drop old privacy-invasive columns
ALTER TABLE analytics_events DROP COLUMN IF EXISTS user_agent;
ALTER TABLE analytics_events DROP COLUMN IF EXISTS ip_address;

-- Add privacy-preserving visitor hash column
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS visitor_hash VARCHAR(64);

-- Add constraint for event types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_event_type'
        AND conrelid = 'analytics_events'::regclass
    ) THEN
        ALTER TABLE analytics_events
        ADD CONSTRAINT chk_event_type
        CHECK (event_type IN ('page_view', 'mosaic_created', 'export_download'));
    END IF;
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_hash ON analytics_events(visitor_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Drop old indexes if they exist with different names
DROP INDEX IF EXISTS idx_analytics_event_type;
DROP INDEX IF EXISTS idx_analytics_created_at;

-- ============================================
-- Analytics Summary Materialized View
-- ============================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS analytics_summary;

-- Create new materialized view
CREATE MATERIALIZED VIEW analytics_summary AS
SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT visitor_hash) FILTER (WHERE event_type = 'page_view') as unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'mosaic_created') as mosaics_created,
    COUNT(*) FILTER (WHERE event_type = 'export_download' AND export_type = 'mosaic-png') as mosaic_downloads,
    COUNT(*) FILTER (WHERE event_type = 'export_download' AND export_type = 'instructions-png') as instruction_downloads,
    COUNT(*) FILTER (WHERE event_type = 'export_download' AND export_type = 'shopping-csv') as csv_downloads,
    COUNT(*) FILTER (WHERE event_type = 'export_download') as total_downloads
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX idx_analytics_summary_date ON analytics_summary(date);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old analytics events (optional, for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired refresh tokens
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR is_revoked = TRUE;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE admins IS 'Admin users who can access the analytics dashboard';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for token rotation and security';
COMMENT ON TABLE analytics_events IS 'Privacy-focused analytics events (no personal data stored)';
COMMENT ON MATERIALIZED VIEW analytics_summary IS 'Aggregated daily analytics for dashboard performance';

COMMENT ON COLUMN analytics_events.visitor_hash IS 'Hashed identifier for unique visitor counting - NOT reversible to IP address';
COMMENT ON COLUMN analytics_events.metadata IS 'Additional event data in JSON format';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA256 hash of the refresh token - actual token never stored';

-- ============================================
-- Migration Complete
-- ============================================

-- NOTE: After running this migration, you should:
-- 1. Create an initial admin user using the create_admin.py script
-- 2. Set up a cron job to refresh the materialized view regularly
-- 3. Optionally set up a cron job to cleanup old analytics events
