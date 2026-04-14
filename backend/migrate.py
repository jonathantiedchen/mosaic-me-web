#!/usr/bin/env python3
"""
One-time migration script to be run on Railway
Usage: Deploy this and run it once, then remove it
"""
import os
import sys

# Add the src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from db.database import get_db_connection

def run_migrations():
    """Run all migration files"""
    print("🔄 Starting database migrations...")

    migrations = [
        'migrations/001_initial_schema.sql',
        'migrations/002_admin_auth_analytics.sql',
        'migrations/003_fix_visitor_count.sql',
        'migrations/004_user_feedback.sql'
    ]

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        for migration_file in migrations:
            print(f"\n📄 Running {migration_file}...")

            file_path = os.path.join(os.path.dirname(__file__), migration_file)

            with open(file_path, 'r') as f:
                sql = f.read()

            cur.execute(sql)
            conn.commit()
            print(f"✅ {migration_file} completed successfully")

        cur.close()
        conn.close()

        print("\n🎉 All migrations completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    run_migrations()
