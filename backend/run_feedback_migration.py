#!/usr/bin/env python3
"""
Run feedback migration on Railway
Usage: python3 run_feedback_migration.py
"""
import os
import sys

# Add the src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from db.database import get_db_connection

def run_feedback_migration():
    """Run the feedback migration"""
    print("🔄 Running feedback migration...")

    migration_file = 'migrations/004_user_feedback.sql'

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        print(f"\n📄 Running {migration_file}...")

        file_path = os.path.join(os.path.dirname(__file__), migration_file)

        with open(file_path, 'r') as f:
            sql = f.read()

        cur.execute(sql)
        conn.commit()
        print(f"✅ {migration_file} completed successfully")

        # Verify table was created
        cur.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'user_feedback'
            ORDER BY ordinal_position;
        """)
        columns = cur.fetchall()

        print(f"\n✅ Table 'user_feedback' created with {len(columns)} columns:")
        for col_name, col_type in columns:
            print(f"  - {col_name}: {col_type}")

        cur.close()
        conn.close()

        print("\n🎉 Feedback migration completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    run_feedback_migration()
