#!/bin/bash
# Run database migrations on Railway

set -e

echo "Running database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Run migrations in order
echo "Running migration 001_initial_schema.sql..."
psql "$DATABASE_URL" -f /app/migrations/001_initial_schema.sql

echo "Running migration 002_admin_auth_analytics.sql..."
psql "$DATABASE_URL" -f /app/migrations/002_admin_auth_analytics.sql

echo "Migrations completed successfully!"
