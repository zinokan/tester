# Zenni Dating App

A modern, location-based social discovery and dating application built with React Native, Node.js, and PostgreSQL.

## Features

- 🔥 **Swipe Interface**: Intuitive card-based matching system
- 📍 **Location-Based**: Find matches nearby with GPS integration
- 💬 **Real-time Chat**: Secure messaging with WebSocket support
- 🔒 **Safety First**: Profile verification and reporting system
- 💎 **Premium Features**: Multiple subscription tiers
- 🌍 **Global**: Multi-language support and cultural adaptation

## Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **React** - Web application
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Navigation** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Socket.io** - Real-time communication
- **JWT** - Authentication

### Infrastructure
- **Docker** - Containerization
- **AWS/Firebase** - Cloud services
- **Cloudinary** - Image management

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run setup
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Servers**
   ```bash
   npm run dev
   ```

4. **Run Mobile App**
   ```bash
   npm run mobile
   ```

## Project Structure

```
zenni-dating-app/
├── client/          # React web application
├── mobile/          # React Native mobile app
├── server/          # Node.js backend API
├── shared/          # Shared utilities and types
└── docs/           # Documentation
```

## API Documentation

- **Authentication**: `/api/auth`
- **Users**: `/api/users`
- **Matches**: `/api/matches`
- **Messages**: `/api/messages`
- **Premium**: `/api/premium`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details