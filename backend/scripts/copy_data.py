#!/usr/bin/env python3
"""Copy all app data from one Postgres database to another.

Used to move from Railway to Supabase. The target must already have the
schema (migrations 001-005) and empty tables.

Reads OLD_DATABASE_URL and NEW_DATABASE_URL from the environment or from
backend/.env.migration (gitignored). Use Supabase's direct or session-pooler
URL for NEW_DATABASE_URL, not the transaction pooler.

    python backend/scripts/copy_data.py
"""
import io
import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# Parents before children, so foreign keys hold during the copy
TABLES = ["admins", "refresh_tokens", "sessions", "analytics_events", "user_feedback"]


def columns(cur, table):
    cur.execute(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema = 'public' AND table_name = %s ORDER BY ordinal_position",
        (table,),
    )
    return [row[0] for row in cur.fetchall()]


def count(cur, table):
    cur.execute(f'SELECT COUNT(*) FROM "{table}"')
    return cur.fetchone()[0]


def main():
    load_dotenv(Path(__file__).resolve().parent.parent / ".env.migration")
    old_url, new_url = os.getenv("OLD_DATABASE_URL"), os.getenv("NEW_DATABASE_URL")
    if not old_url or not new_url:
        sys.exit("Set OLD_DATABASE_URL and NEW_DATABASE_URL (see backend/.env.migration)")

    old = psycopg2.connect(old_url)
    new = psycopg2.connect(new_url)
    old.set_session(readonly=True)
    src, dst = old.cursor(), new.cursor()

    for table in TABLES:
        if count(dst, table):
            sys.exit(f"Target table {table} is not empty; nothing was copied")

    try:
        for table in TABLES:
            source_columns = columns(src, table)
            if not source_columns:
                print(f"{table}: not in source, skipped")
                continue
            target_columns = set(columns(dst, table))
            shared = [c for c in source_columns if c in target_columns]
            dropped = [c for c in source_columns if c not in target_columns]
            column_list = ", ".join(f'"{c}"' for c in shared)

            buffer = io.StringIO()
            src.copy_expert(f'COPY (SELECT {column_list} FROM "{table}") TO STDOUT', buffer)
            buffer.seek(0)
            dst.copy_expert(f'COPY "{table}" ({column_list}) FROM STDIN', buffer)
            note = f" (not copied: {', '.join(dropped)})" if dropped else ""
            print(f"{table}: {count(src, table)} rows{note}")

        # Keep serial ids ahead of the copied rows
        for table in ("analytics_events", "user_feedback"):
            dst.execute(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM {table}), 0) + 1, false)"
            )
        dst.execute("REFRESH MATERIALIZED VIEW analytics_summary")
        new.commit()
    except Exception:
        new.rollback()
        raise

    print("\nRow counts (old -> new):")
    mismatch = False
    for table in TABLES:
        if not columns(src, table):
            continue
        before, after = count(src, table), count(dst, table)
        mismatch |= before != after
        print(f"  {table}: {before} -> {after}")
    old.close()
    new.close()
    if mismatch:
        sys.exit("Row counts differ")


if __name__ == "__main__":
    main()
