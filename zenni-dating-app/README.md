# Zenni Dating App

A location-based dating application built with Spring Boot backend and Flutter frontend, designed to help people find meaningful relationships through swiping and matching.

## 🚀 Features

### Core Features
- **User Authentication**: Firebase Auth integration with social login support
- **Profile Management**: Photo uploads, bio, preferences, and verification
- **Discovery & Matching**: Swipe-based interface with location-based recommendations
- **Real-time Chat**: End-to-end encrypted messaging with WebSocket support
- **Premium Subscriptions**: Multiple tiers with advanced features

### Premium Features
- **Zenni Plus** ($9.99/month): Unlimited likes, 5 Super Likes/day, Rewind, Passport, Ad-free
- **Zenni Gold** ($29.99/month): All Plus + "Likes You", Top Picks, 10 Super Likes/day, Read Receipts
- **Zenni Platinum** ($39.99/month): All Gold + Message-Before-Match, Priority Likes, 20 Super Likes/day, Message Analytics

## 🏗️ Architecture

### Backend (Spring Boot 3.x)
- **Framework**: Spring Boot 3.2.0 with Java 17
- **Database**: H2 (development) / PostgreSQL (production)
- **Authentication**: Firebase Admin SDK
- **Security**: Spring Security with JWT tokens
- **APIs**: RESTful APIs with comprehensive error handling
- **Real-time**: WebSocket support for chat functionality

### Frontend (Flutter 3.x)
- **Framework**: Flutter 3.x with Dart
- **State Management**: BLoC pattern
- **Navigation**: GoRouter for type-safe navigation
- **Networking**: Dio for HTTP requests
- **Local Storage**: Hive for offline caching
- **UI**: Material Design 3 with custom theming

## 📁 Project Structure

```
zenni-dating-app/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/zenni/dating/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access layer
│   │   ├── model/          # Entity models
│   │   ├── dto/            # Data transfer objects
│   │   ├── config/         # Configuration classes
│   │   └── security/       # Security configuration
│   └── src/main/resources/
│       └── application.yml  # Application configuration
├── frontend/               # Flutter frontend
│   └── zenni_dating_app/
│       ├── lib/
│       │   ├── core/       # Core utilities and configuration
│       │   └── features/   # Feature-based modules
│       │       ├── auth/   # Authentication
│       │       ├── discovery/ # Discovery and swiping
│       │       ├── matches/   # Matches management
│       │       ├── messages/  # Chat functionality
│       │       ├── profile/   # Profile management
│       │       └── premium/   # Premium features
│       └── pubspec.yaml    # Flutter dependencies
└── docs/                   # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Flutter 3.x
- Firebase project setup
- PostgreSQL (for production)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zenni-dating-app/backend
   ```

2. **Configure Firebase**
   - Create a Firebase project
   - Download the service account key
   - Place it in `src/main/resources/firebase-service-account.json`

3. **Update configuration**
   - Modify `src/main/resources/application.yml` with your database settings
   - Update Firebase project ID and other configurations

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

   The API will be available at `http://localhost:8080/api`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd zenni-dating-app/frontend/zenni_dating_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   - Add your Firebase configuration to `lib/core/config/firebase_config.dart`
   - Update the Firebase project settings

4. **Run the application**
   ```bash
   flutter run
   ```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/user/{firebaseUid}` - Get user by Firebase UID
- `PUT /api/auth/user/{id}` - Update user profile
- `DELETE /api/auth/user/{id}` - Delete user account

### Discovery
- `GET /api/discovery/matches/{userId}` - Get potential matches

### Swiping
- `POST /api/swipe/{swiperId}` - Process swipe action
- `GET /api/swipe/count/{userId}/{type}` - Get swipe count

### Matches
- `GET /api/matches/user/{userId}` - Get user's matches
- `GET /api/matches/{matchId}/user/{userId}` - Get specific match
- `DELETE /api/matches/{matchId}/user/{userId}` - Unmatch

### Messages
- `POST /api/messages/send/{senderId}` - Send message
- `GET /api/messages/match/{matchId}/user/{userId}` - Get messages for match
- `POST /api/messages/match/{matchId}/user/{userId}/read` - Mark messages as read
- `GET /api/messages/unread/count/{userId}` - Get unread message count

## 🔒 Security Features

- Firebase Authentication integration
- JWT token-based authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting (planned)
- Data encryption at rest

## 🚀 Deployment

### Backend Deployment
- Configured for Google Cloud Run
- Docker support (Dockerfile included)
- Environment-specific configurations
- Health check endpoints

### Frontend Deployment
- Flutter Web support
- Firebase Hosting ready
- Progressive Web App (PWA) capabilities
- Responsive design for all screen sizes

## 📊 Performance Targets

- Profile load: < 300ms
- Image load: < 2s
- Match notification: < 5s
- Auto-scale to 75M MAU
- 99.9% uptime SLA

## 🧪 Testing

### Backend Testing
- Unit tests for services and repositories
- Integration tests for API endpoints
- Test coverage reporting

### Frontend Testing
- Unit tests for BLoCs and use cases
- Widget tests for UI components
- Integration tests for user flows

## 📈 Monitoring & Analytics

- Firebase Analytics integration
- Performance monitoring
- Error tracking and reporting
- User engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Contact the development team

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Basic authentication and user management
- [x] Core matching and swiping functionality
- [x] Real-time messaging
- [x] Premium subscription system

### Phase 2 (Planned)
- [ ] Advanced matching algorithms
- [ ] Video calling integration
- [ ] Enhanced safety features
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] AI-powered recommendations
- [ ] Social features and events
- [ ] Advanced analytics dashboard
- [ ] Global expansion features