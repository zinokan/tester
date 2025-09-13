# Zenni Dating App Deployment Guide

## Overview
This guide covers deploying the Zenni Dating App to production using Google Cloud Platform (GCP) with Firebase integration.

## Prerequisites
- Google Cloud Platform account
- Firebase project setup
- Docker installed locally
- gcloud CLI installed and configured
- Flutter SDK for building the frontend

## Architecture

### Production Stack
- **Backend**: Google Cloud Run (Spring Boot)
- **Frontend**: Firebase Hosting (Flutter Web)
- **Database**: Cloud SQL (PostgreSQL)
- **Authentication**: Firebase Auth
- **Storage**: Cloud Storage (for photos)
- **Caching**: Cloud Memorystore (Redis)
- **CDN**: Firebase CDN

## Backend Deployment

### 1. Prepare Firebase Service Account
```bash
# Download service account key from Firebase Console
# Place it in backend/firebase-service-account.json
```

### 2. Build and Push Docker Image
```bash
cd backend

# Build the image
docker build -t gcr.io/PROJECT_ID/zenni-backend .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/zenni-backend
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy zenni-backend \
  --image gcr.io/PROJECT_ID/zenni-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SPRING_PROFILES_ACTIVE=production" \
  --set-env-vars="DATABASE_URL=jdbc:postgresql:///zenni_db?cloudSqlInstance=PROJECT_ID:REGION:INSTANCE_NAME&socketFactory=com.google.cloud.sql.postgres.SocketFactory" \
  --set-env-vars="FIREBASE_PROJECT_ID=PROJECT_ID"
```

### 4. Configure Cloud SQL
```bash
# Create Cloud SQL instance
gcloud sql instances create zenni-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create zenni_db --instance=zenni-db

# Create user
gcloud sql users create zenni_user --instance=zenni-db --password=SECURE_PASSWORD
```

## Frontend Deployment

### 1. Build Flutter Web App
```bash
cd frontend/zenni_dating_app

# Get dependencies
flutter pub get

# Build for web
flutter build web --release --web-renderer html
```

### 2. Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### 3. Configure Firebase Hosting
Create `firebase.json`:
```json
{
  "hosting": {
    "public": "build/web",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Environment Configuration

### Backend Environment Variables
```yaml
# application-prod.yml
spring:
  profiles:
    active: production
  datasource:
    url: jdbc:postgresql:///zenni_db?cloudSqlInstance=${CLOUD_SQL_INSTANCE}&socketFactory=com.google.cloud.sql.postgres.SocketFactory
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

firebase:
  project-id: ${FIREBASE_PROJECT_ID}
  service-account-key: classpath:firebase-service-account.json

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

cors:
  allowed-origins:
    - "https://zenni-dating-app.web.app"
    - "https://zenni-dating-app.firebaseapp.com"
```

### Frontend Environment Configuration
Update `lib/core/config/app_config.dart`:
```dart
class AppConfig {
  static const String apiBaseUrl = 'https://zenni-backend-XXXXX-uc.a.run.app/api';
  static const String wsBaseUrl = 'wss://zenni-backend-XXXXX-uc.a.run.app/ws';
  // ... other config
}
```

## Security Configuration

### 1. CORS Settings
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://zenni-dating-app.web.app",
            "https://zenni-dating-app.firebaseapp.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Firebase Security Rules
```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /matches/{matchId} {
      allow read, write: if request.auth != null && 
        (resource.data.user1Id == request.auth.uid || 
         resource.data.user2Id == request.auth.uid);
    }
    
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/matches/$(resource.data.matchId)) &&
        (get(/databases/$(database)/documents/matches/$(resource.data.matchId)).data.user1Id == request.auth.uid ||
         get(/databases/$(database)/documents/matches/$(resource.data.matchId)).data.user2Id == request.auth.uid);
    }
  }
}

// Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Monitoring and Logging

### 1. Cloud Logging
```bash
# View logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=zenni-backend" --limit=50
```

### 2. Cloud Monitoring
- Set up alerts for error rates
- Monitor response times
- Track user engagement metrics

### 3. Health Checks
```java
@RestController
public class HealthController {
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(status);
    }
}
```

## Scaling Configuration

### 1. Cloud Run Scaling
```yaml
# cloud-run-config.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: zenni-backend
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "100"
        autoscaling.knative.dev/minScale: "1"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/PROJECT_ID/zenni-backend
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
```

### 2. Database Scaling
- Enable read replicas for read-heavy operations
- Configure connection pooling
- Set up automated backups

## CI/CD Pipeline

### 1. GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Build and Deploy
        run: |
          cd backend
          ./mvnw clean package
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/zenni-backend .
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/zenni-backend
          gcloud run deploy zenni-backend --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/zenni-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - name: Build and Deploy
        run: |
          cd frontend/zenni_dating_app
          flutter pub get
          flutter build web --release
          firebase deploy --only hosting
```

## Performance Optimization

### 1. Backend Optimizations
- Enable connection pooling
- Implement caching with Redis
- Use CDN for static assets
- Optimize database queries

### 2. Frontend Optimizations
- Enable code splitting
- Implement lazy loading
- Optimize images
- Use service workers for offline support

## Backup and Recovery

### 1. Database Backups
```bash
# Automated daily backups
gcloud sql backups create --instance=zenni-db --description="Daily backup"
```

### 2. Application Data
- Regular exports of user data
- Photo backup to Cloud Storage
- Configuration backup

## Troubleshooting

### Common Issues
1. **CORS errors**: Check allowed origins in backend configuration
2. **Database connection**: Verify Cloud SQL instance and credentials
3. **Firebase auth**: Ensure service account key is properly configured
4. **Memory issues**: Increase Cloud Run memory allocation

### Debug Commands
```bash
# Check Cloud Run logs
gcloud logs read "resource.type=cloud_run_revision" --limit=100

# Test database connection
gcloud sql connect zenni-db --user=zenni_user

# Check Firebase project status
firebase projects:list
```

## Cost Optimization

### 1. Resource Sizing
- Start with minimal resources and scale up
- Use preemptible instances for non-critical workloads
- Implement auto-scaling policies

### 2. Monitoring Costs
- Set up billing alerts
- Regular cost reviews
- Optimize based on usage patterns

## Security Checklist

- [ ] Enable Cloud Armor for DDoS protection
- [ ] Configure VPC for network isolation
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Penetration testing
- [ ] Data encryption at rest and in transit
- [ ] Access control and IAM policies
- [ ] Regular backup testing