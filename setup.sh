#!/bin/bash
set -e

echo "🎬 MusicApp Development Setup"
echo "=============================="

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
fi

echo ""
echo "🚀 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run prisma:push

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Available commands:"
echo "  npm run dev              - Start development servers"
echo "  docker-compose up        - Start containers"
echo "  docker-compose down      - Stop containers"
echo "  docker-compose logs -f   - View container logs"
echo ""
echo "🌐 Services:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3000"
echo "  PostgreSQL: localhost:5432"
echo "  Redis:     localhost:6379"
echo ""
