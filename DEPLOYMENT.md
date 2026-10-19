# Deployment Guide - Vercel + Supabase

Mosaic-Me runs as **one Vercel project** with a **Supabase Postgres** database:

- **Frontend**: the Vite build in `frontend/dist`, served as static files by Vercel.
- **Backend**: the FastAPI app, served as a Python function by `api/index.py`.
  `vercel.json` sends every `/api/*` request to it, so frontend and API share one
  domain. CORS and `VITE_API_URL` are not needed in production.
- **Database**: Supabase Postgres, used only as a database. The backend connects
  directly; the Supabase Data API and Supabase Auth are not used.

Preview deployments (one per branch/PR) take the place of a staging environment.

## Files that matter

| File | Purpose |
| --- | --- |
| `vercel.json` | Build command, output folder, function settings, rewrites, headers |
| `api/index.py` | Python function entrypoint; imports `backend/src/main.py` |
| `requirements.txt` | Python dependencies (`backend/requirements.txt` includes it) |
| `.python-version` | Python version for the function (3.12) |
| `backend/migrations/*.sql` | Database schema, applied in order |

## Platform limits to keep in mind

- **4.5 MB request and response bodies.** The browser shrinks photos to at most
  2048 px before upload (`frontend/src/services/api.ts`). The largest response,
  the upload result at 128×128 studs, is about 2 MB.
- **Read-only filesystem.** Uploads are processed in memory; never write to disk.
- **No long-lived server.** Startup hooks run on every cold start, so periodic
  jobs live in the database as `pg_cron` jobs (migration 005).

## 1. Supabase

1. Create a project (region: Frankfurt, `eu-central-1`, to sit next to the
   `fra1` Vercel function region).
2. Apply the migrations in order, `001` to `005`, with the SQL editor or `psql`:

   ```bash
   for f in backend/migrations/00*.sql; do psql "$SUPABASE_DIRECT_URL" -v ON_ERROR_STOP=1 -f "$f"; done
   ```

   Migration `005` is required on Supabase. It turns on row-level security,
   revokes the Data API roles' access to every table, view and function (so the
   public anon key cannot read admin password hashes or call cleanup functions),
   and schedules the cleanup jobs.
3. Under **Connect**, copy the **Transaction pooler** connection string (port
   `6543`), unless the Supabase integration provides it (step 2.2). The backend turns off
   prepared-statement caching, which the transaction pooler requires.

## 2. Vercel

1. Import the GitHub repository as a new project. Leave the root directory as
   the repository root; `vercel.json` sets the build.
2. Connect the database with the **Supabase integration** (Vercel Marketplace →
   Supabase → link the existing `mosaic-me` project to this Vercel project). It
   sets `POSTGRES_URL` (transaction pooler) and keeps it in sync; the backend
   reads it when `DATABASE_URL` is not set and strips the URL parameters
   asyncpg does not understand. Without the integration, set `DATABASE_URL` to
   the transaction pooler URL (port 6543) yourself.
3. Add the remaining environment variables (Production and Preview):

   | Variable | Value |
   | --- | --- |
   | `JWT_SECRET_KEY` | `openssl rand -hex 32` |
   | `ANALYTICS_SALT` | `openssl rand -hex 16` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` (optional) |
   | `REFRESH_TOKEN_EXPIRE_DAYS` | `7` (optional) |

   Keep `JWT_SECRET_KEY` and `ANALYTICS_SALT` the same as before a migration, or
   existing admin sessions end and daily visitor counts split on the switch day.
4. Deploy. Check `https://<your-domain>/api/v1/health`.

## 3. Admin user

Run locally against the Supabase database:

```bash
cd backend
DATABASE_URL="<supabase direct or session pooler URL>" python scripts/create_admin.py
```

## Copying data from another Postgres

Apply migrations `001`–`005` to the new database first, then copy only the data:

```bash
pg_dump "$OLD_DATABASE_URL" --data-only --no-owner --no-privileges \
  -t sessions -t analytics_events -t admins -t refresh_tokens -t user_feedback > data.sql
psql "$SUPABASE_DIRECT_URL" -v ON_ERROR_STOP=1 -f data.sql
psql "$SUPABASE_DIRECT_URL" -c "REFRESH MATERIALIZED VIEW analytics_summary"
```

Use a `pg_dump` at least as new as the source server's Postgres version.

## Local development

Unchanged: `npm run dev:backend` and `npm run dev:frontend`. Vite proxies `/api`
to `localhost:8000`, the same layout as production.

## Troubleshooting

- **Function logs**: Vercel dashboard → project → Logs, or `vercel logs`.
- **`prepared statement ... already exists`**: `DATABASE_URL` points at the
  pooler but the backend's statement cache is on; check `backend/src/db/database.py`.
- **`413` / `FUNCTION_PAYLOAD_TOO_LARGE`**: a request or response went over 4.5 MB.
- **Paused database**: free Supabase projects pause after about a week without
  activity. Restore it from the Supabase dashboard.
