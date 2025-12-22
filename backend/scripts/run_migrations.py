#!/usr/bin/env python3
"""Run database migrations on Railway"""
import os
import sys
import psycopg2

def run_migrations():
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("Error: DATABASE_URL environment variable is not set")
        sys.exit(1)

    print("Running database migrations...")

    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        # Read and execute migration files
        migrations = [
            'backend/migrations/001_initial_schema.sql',
            'backend/migrations/002_admin_auth_analytics.sql'
        ]

        for migration_file in migrations:
            print(f"\nRunning migration {migration_file}...")

            with open(migration_file, 'r') as f:
                sql = f.read()

            cur.execute(sql)
            conn.commit()
            print(f"✓ {migration_file} completed successfully")

        cur.close()
        conn.close()

        print("\n✓ All migrations completed successfully!")

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_migrations()
