# Privacy & Data Protection

The published privacy policy is the `/privacy` page of the site
(source: [`frontend/src/pages/PrivacyPage.tsx`](frontend/src/pages/PrivacyPage.tsx)).
The controller is Jonathan Tiedchen (Denmark); the supervisory authority is the
Danish Data Protection Agency (Datatilsynet). There is deliberately no legal
notice/Impressum: this is a private, non-commercial project.

This file is the developer reference for what the code actually processes. When
you change any of it, update the privacy page in the same change.

## Data flows

| Data | Where | Stored? | Retention | Legal basis |
|---|---|---|---|---|
| Uploaded photo | `POST /api/v1/upload`, processed in memory | No (never written to disk, DB or logs) | none | Art. 6(1)(b) |
| Export grid (color codes only) | `POST /api/v1/export/*` | No | none | Art. 6(1)(b) |
| Usage events: type, time, baseplate size, piece type, export type, mosaic ID, visitor ID | `analytics_events` | Yes | 90 days (`cleanup_old_analytics`, migration 005) | Art. 6(1)(f) |
| Daily totals (counts only) | `analytics_summary` materialized view | Yes | indefinitely (no personal data) | — |
| Feedback: rating, comment (≤1000 chars), optional mosaic ID, visitor ID, time | `user_feedback` | Yes | 365 days (`cleanup_old_feedback`, migration 007) | Art. 6(1)(f) |
| Admin email, password hash (bcrypt), login times, hashed refresh tokens | `admins`, `refresh_tokens` | Yes | until the admin is deleted; expired tokens cleaned up daily | Art. 6(1)(f) |
| Request logs incl. IP address and user agent | Vercel (host) | By Vercel | per Vercel's plan | Art. 6(1)(f) |

## Visitor ID

`backend/src/middleware/analytics.py` computes
`sha256(first X-Forwarded-For IP or client IP : user agent : UTC date : ANALYTICS_SALT)`.
The raw IP and user agent are not stored. The ID rotates daily.

This is **pseudonymous, not anonymous** data:

- The mosaic `session_id` can link events and feedback about one mosaic across days.
- Anyone who holds `ANALYTICS_SALT` can test whether an IP address produced a given ID, because the IPv4 space is small enough to brute-force.

So GDPR applies. The legal basis is legitimate interest, and visitors can object
under Art. 21. Nothing is stored on or read from the visitor's device, so the
ePrivacy cookie-consent rules (Danish Executive Order on cookies) are not triggered.

Keep `ANALYTICS_SALT` secret and random. The app's logs include only the first 8
hex characters of a visitor ID, never IP addresses.

## Third parties

- **Vercel Inc. (USA)** hosts the site and runs the API in `fra1` (Frankfurt). It needs a data processing agreement, and transfers rely on the EU-US Data Privacy Framework and the SCCs.
- **Supabase Inc.** runs the PostgreSQL database. It also needs a data processing agreement. Use an EU region.
- **Fonts** are bundled with Fontsource (`@fontsource-variable/dm-sans`, `@fontsource/dm-serif-display`) and served from our own domain. No Google Fonts requests are made.
- **No third-party scripts, analytics services or embeds.** External sites (LEGO, BrickLink, GitHub, Unsplash) are plain links.

## Browser storage

Only the admin dashboard uses browser storage: the `access_token` and
`refresh_token` in `localStorage`, which are strictly necessary for login.
Visitors get nothing stored.
