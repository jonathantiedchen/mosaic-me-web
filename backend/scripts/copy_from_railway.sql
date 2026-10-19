-- One-off: pull all app data from the old Railway database into Supabase.
-- Run in the Supabase SQL editor of the mosaic-me project.
-- Fill in PASSWORD in the dblink_connect line below: the part between
-- "postgres:" and "@" in Railway's DATABASE_PUBLIC_URL. Change host/port too
-- if that URL shows different ones.
-- Safe to run only once, on empty tables; it stops if data already exists.

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA extensions;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM admins) OR EXISTS (SELECT 1 FROM analytics_events) THEN
        RAISE EXCEPTION 'Target tables are not empty; nothing was copied';
    END IF;
END $$;

SELECT extensions.dblink_connect('railway',
    'host=turntable.proxy.rlwy.net port=43448 dbname=railway user=postgres password=PASSWORD sslmode=require');

BEGIN;

INSERT INTO admins (id, email, password_hash, full_name, is_active, created_at, updated_at, last_login_at)
SELECT * FROM extensions.dblink('railway',
    'SELECT id, email, password_hash, full_name, is_active, created_at, updated_at, last_login_at FROM admins')
AS t(id uuid, email varchar, password_hash varchar, full_name varchar, is_active boolean,
     created_at timestamptz, updated_at timestamptz, last_login_at timestamptz);

INSERT INTO refresh_tokens (id, admin_id, token_hash, expires_at, created_at, revoked_at, is_revoked)
SELECT * FROM extensions.dblink('railway',
    'SELECT id, admin_id, token_hash, expires_at, created_at, revoked_at, is_revoked FROM refresh_tokens')
AS t(id uuid, admin_id uuid, token_hash varchar, expires_at timestamptz, created_at timestamptz,
     revoked_at timestamptz, is_revoked boolean);

INSERT INTO analytics_events (id, event_type, session_id, baseplate_size, piece_type, export_type, created_at, metadata, visitor_hash)
SELECT * FROM extensions.dblink('railway',
    'SELECT id, event_type, session_id, baseplate_size, piece_type, export_type, created_at, metadata, visitor_hash FROM analytics_events')
AS t(id bigint, event_type varchar, session_id uuid, baseplate_size integer, piece_type varchar,
     export_type varchar, created_at timestamptz, metadata jsonb, visitor_hash varchar);

-- Keep new ids ahead of the copied ones
SELECT setval(pg_get_serial_sequence('analytics_events', 'id'),
              COALESCE((SELECT MAX(id) FROM analytics_events), 0) + 1, false);

COMMIT;

SELECT extensions.dblink_disconnect('railway');
REFRESH MATERIALIZED VIEW analytics_summary;
DROP EXTENSION dblink;

-- Expect: admins 1, refresh_tokens 36, analytics_events 8999
SELECT (SELECT COUNT(*) FROM admins) AS admins,
       (SELECT COUNT(*) FROM refresh_tokens) AS refresh_tokens,
       (SELECT COUNT(*) FROM analytics_events) AS analytics_events;
