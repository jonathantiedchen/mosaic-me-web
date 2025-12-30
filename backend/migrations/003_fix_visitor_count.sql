-- Migration: Fix visitor count to include all events, not just page_view
-- Description: Updates the analytics_summary materialized view to count unique visitors
--              from ANY event type, not just page_view events. This is necessary because
--              the frontend and backend are on separate domains.
-- Created: 2025-12-25

-- Drop the existing materialized view
DROP MATERIALIZED VIEW IF EXISTS analytics_summary;

-- Recreate with fixed unique_visitors calculation
CREATE MATERIALIZED VIEW analytics_summary AS
SELECT
    DATE(created_at) as date,
    -- Count unique visitors from ANY event type (not just page_view)
    -- This is because frontend/backend are separate, so page_view may not be tracked
    COUNT(DISTINCT visitor_hash) FILTER (WHERE visitor_hash IS NOT NULL) as unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'mosaic_created') as mosaics_created,
    COUNT(*) FILTER (WHERE event_type = 'export_download' AND export_type = 'mosaic-png') as mosaic_downloads,
    COUNT(*) FILTER (WHERE event_type = 'export_download' AND export_type = 'instructions-png') as instruction_downloads,
    COUNT(*) FILTER (WHERE event_type = 'export_download' AND export_type = 'shopping-csv') as csv_downloads,
    COUNT(*) FILTER (WHERE event_type = 'export_download') as total_downloads
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Recreate the unique index
CREATE UNIQUE INDEX idx_analytics_summary_date ON analytics_summary(date);

-- Refresh the view to populate with current data
REFRESH MATERIALIZED VIEW analytics_summary;

-- Add comment explaining the change
COMMENT ON MATERIALIZED VIEW analytics_summary IS
'Aggregated daily analytics for dashboard performance. Unique visitors counted from all event types (not just page_view) since frontend/backend are separate domains.';
