#!/bin/bash
# entrypoint.sh - Run migrations then start server

set -e

echo "🔄 Running database migrations..."

# Try migrate deploy first (for production migrations)
if npx prisma migrate deploy; then
    echo "✅ Migrations deployed successfully"
else
    echo "⚠️  Migrate deploy failed, trying db push..."
    # Fallback to db push for development/initial setup
    npx prisma db push --accept-data-loss
    echo "✅ Database schema pushed successfully"
fi

echo "🚀 Starting server..."
exec node dist/index.js
