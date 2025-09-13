#!/bin/bash

# Zenni Dating App Deployment Script
echo "🚀 Deploying Zenni Dating App..."

# Configuration
ENVIRONMENT=${1:-production}
REGISTRY=${2:-your-registry.com}
VERSION=${3:-latest}

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Registry: $REGISTRY"
echo "   Version: $VERSION"

# Build and tag images
echo "🔨 Building and tagging images..."

# Backend
docker build -t $REGISTRY/zenni-backend:$VERSION ./server
docker build -t $REGISTRY/zenni-frontend:$VERSION ./client

# Push images to registry
echo "📤 Pushing images to registry..."
docker push $REGISTRY/zenni-backend:$VERSION
docker push $REGISTRY/zenni-frontend:$VERSION

# Update docker-compose for production
echo "📝 Updating docker-compose for production..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: zenni_db
      POSTGRES_USER: zenni_user
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - zenni-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - zenni-network

  backend:
    image: $REGISTRY/zenni-backend:$VERSION
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://zenni_user:\${POSTGRES_PASSWORD}@postgres:5432/zenni_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: \${JWT_SECRET}
      PORT: 5000
    depends_on:
      - postgres
      - redis
    networks:
      - zenni-network

  frontend:
    image: $REGISTRY/zenni-frontend:$VERSION
    environment:
      REACT_APP_API_URL: \${API_URL}
    depends_on:
      - backend
    networks:
      - zenni-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - zenni-network

volumes:
  postgres_data:
  redis_data:

networks:
  zenni-network:
    driver: bridge
EOF

echo "✅ Deployment configuration created!"
echo ""
echo "🔧 Next steps:"
echo "1. Update your environment variables in .env.production"
echo "2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Set up SSL certificates in nginx/ssl/"
echo "4. Configure your domain DNS"
echo ""
echo "📚 Production checklist:"
echo "   - [ ] Environment variables configured"
echo "   - [ ] SSL certificates installed"
echo "   - [ ] Database backups configured"
echo "   - [ ] Monitoring setup"
echo "   - [ ] Log aggregation configured"
echo "   - [ ] CDN configured for static assets"