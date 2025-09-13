#!/bin/bash

# Zenni Dating App Setup Script
echo "🚀 Setting up Zenni Dating App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running the app."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p nginx/ssl
mkdir -p server/logs
mkdir -p client/build

# Set permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend npm run migrate

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Setup complete!"
echo ""
echo "🌐 Web App: http://localhost:3000"
echo "🔧 API: http://localhost:5000"
echo "📊 Health Check: http://localhost/health"
echo ""
echo "📱 Mobile App:"
echo "   cd mobile && npm install && npm start"
echo ""
echo "📚 Documentation:"
echo "   - API Docs: http://localhost:5000/api-docs"
echo "   - README: ./README.md"
echo ""
echo "🛠️  Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Update services: docker-compose pull && docker-compose up -d"