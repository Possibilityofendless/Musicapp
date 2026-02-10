#!/bin/bash

# Manual Database Migration Helper
# Use this if Railway CLI linking doesn't work

set -e

echo "=========================================="
echo "MusicApp Manual Database Migration"
echo "=========================================="
echo ""
echo "We need your PostgreSQL connection string from Railway."
echo ""
echo "Steps to get it:"
echo "1. Go to: https://railway.app"
echo "2. Open your 'protective-connection' project"
echo "3. Click 'PostgreSQL' service"
echo "4. Click 'Connect' tab"
echo "5. Copy the connection string that looks like:"
echo "   postgresql://user:password@host:port/database"
echo ""
echo "Enter your PostgreSQL connection string:"
read -p "> " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "Connection string is empty. Exiting."
    exit 1
fi

# Export it so Prisma can use it
export DATABASE_URL

echo ""
echo "Testing connection..."
if command -v psql &> /dev/null; then
    # Extract host and port for testing
    psql "$DATABASE_URL" -c "SELECT 1;" || {
        echo "❌ Connection failed. Check your string and try again."
        exit 1
    }
else
    echo "(psql not available, skipping connection test)"
fi

echo ""
echo "Running database migrations..."
cd /workspaces/Musicapp/packages/backend

npx prisma db push

echo ""
echo "✓ Migrations complete!"
echo ""
echo "Next: Test the API"
echo "  bash /workspaces/Musicapp/test-api.sh"
