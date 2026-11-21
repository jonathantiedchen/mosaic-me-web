-- Migration 008: Share links for mosaics
--
-- "Get a share link" saves only the mosaic's colors (never the photo) under a
-- random 12-character id. Nothing identifies who saved it. A link is deleted
-- 365 days after it was last opened; the privacy policy states this period,
-- change both together.

CREATE TABLE IF NOT EXISTS shared_mosaics (
    id VARCHAR(16) PRIMARY KEY,
    piece_type VARCHAR(10) NOT NULL,
    baseplate_size INTEGER NOT NULL,
    colors JSONB NOT NULL,
    cells TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_shared_piece_type CHECK (piece_type IN ('square', 'round')),
    CONSTRAINT chk_shared_baseplate_size CHECK (baseplate_size IN (32, 48, 64, 96, 128)),
    -- One base64 byte per stud: 128 x 128 studs is 21,848 characters
    CONSTRAINT chk_shared_cells_length CHECK (char_length(cells) <= 22000)
);

CREATE INDEX IF NOT EXISTS idx_shared_mosaics_created_at ON shared_mosaics(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_mosaics_last_opened_at ON shared_mosaics(last_opened_at);

-- Same lock-down as migration 005: no access through the Supabase Data API
ALTER TABLE shared_mosaics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON shared_mosaics FROM anon, authenticated;

CREATE OR REPLACE FUNCTION cleanup_unused_shared_mosaics(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM shared_mosaics
    WHERE last_opened_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

REVOKE EXECUTE ON FUNCTION cleanup_unused_shared_mosaics(integer) FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('cleanup-unused-shared-mosaics', '57 3 * * *', $$SELECT cleanup_unused_shared_mosaics(365)$$);

-- To run this migration:
-- psql $DATABASE_URL -f backend/migrations/008_shared_mosaics.sql
