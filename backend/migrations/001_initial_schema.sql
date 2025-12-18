-- Mosaic-Me Database Schema
-- Initial migration

-- Sessions table (for persistent storage if needed later)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    mosaic_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for cleanup queries
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Analytics events table (optional, for basic logging)
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    session_id UUID,
    baseplate_size INTEGER,
    piece_type VARCHAR(20),
    export_type VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Indexes for analytics
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_session_id ON analytics_events(session_id);

-- Function to automatically delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE sessions IS 'Stores mosaic session data with automatic expiration';
COMMENT ON TABLE analytics_events IS 'Logs application events for analytics';
COMMENT ON FUNCTION delete_expired_sessions() IS 'Removes expired session records';
