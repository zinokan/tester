# Zenni Dating App API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require Firebase Authentication. Include the Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firebaseUid": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "2023-01-01",
  "gender": "MALE|FEMALE|NON_BINARY|OTHER",
  "lookingForGender": "MALE|FEMALE|NON_BINARY|OTHER",
  "minAge": 18,
  "maxAge": 100,
  "maxDistance": 50,
  "bio": "string",
  "job": "string",
  "education": "string",
  "location": "string",
  "latitude": 0.0,
  "longitude": 0.0
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1998-01-01",
  "age": 25,
  "gender": "MALE",
  "lookingForGender": "FEMALE",
  "minAge": 18,
  "maxAge": 35,
  "maxDistance": 50,
  "bio": "Love to travel and explore new places",
  "job": "Software Engineer",
  "education": "Computer Science",
  "location": "New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "subscriptionTier": "FREE",
  "isVerified": false,
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z",
  "photos": [],
  "interests": []
}
```

#### Get User by Firebase UID
```http
GET /auth/user/{firebaseUid}
```

#### Get User by ID
```http
GET /auth/user/id/{id}
```

#### Update User
```http
PUT /auth/user/{id}
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "2023-01-01",
  "gender": "MALE|FEMALE|NON_BINARY|OTHER",
  "lookingForGender": "MALE|FEMALE|NON_BINARY|OTHER",
  "minAge": 18,
  "maxAge": 100,
  "maxDistance": 50,
  "bio": "string",
  "job": "string",
  "education": "string",
  "location": "string",
  "latitude": 0.0,
  "longitude": 0.0
}
```

#### Delete User
```http
DELETE /auth/user/{id}
```

### Discovery

#### Get Potential Matches
```http
GET /discovery/matches/{userId}
```

**Response:**
```json
[
  {
    "id": 2,
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "age": 23,
    "gender": "FEMALE",
    "bio": "Love hiking and photography",
    "job": "Designer",
    "location": "New York, NY",
    "photos": [
      {
        "id": 1,
        "url": "https://example.com/photo1.jpg",
        "isMain": true,
        "orderIndex": 0
      }
    ],
    "interests": [
      {
        "id": 1,
        "name": "Photography",
        "type": "HOBBY"
      }
    ]
  }
]
```

### Swiping

#### Process Swipe
```http
POST /swipe/{swiperId}
Content-Type: application/json

{
  "swipedUserId": 2,
  "type": "LIKE|PASS|SUPER_LIKE"
}
```

**Response:**
```json
{
  "id": 1,
  "swiperId": 1,
  "swipedId": 2,
  "type": "LIKE",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### Get Swipe Count
```http
GET /swipe/count/{userId}/{type}
```

**Response:**
```json
5
```

### Matches

#### Get User's Matches
```http
GET /matches/user/{userId}
```

**Response:**
```json
[
  {
    "id": 1,
    "user1": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "age": 25,
      "photos": [
        {
          "id": 1,
          "url": "https://example.com/photo1.jpg",
          "isMain": true
        }
      ]
    },
    "user2": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "age": 23,
      "photos": [
        {
          "id": 2,
          "url": "https://example.com/photo2.jpg",
          "isMain": true
        }
      ]
    },
    "isActive": true,
    "lastMessageAt": "2023-01-01T12:00:00Z",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
]
```

#### Get Specific Match
```http
GET /matches/{matchId}/user/{userId}
```

#### Unmatch
```http
DELETE /matches/{matchId}/user/{userId}
```

### Messages

#### Send Message
```http
POST /messages/send/{senderId}
Content-Type: application/json

{
  "matchId": 1,
  "content": "Hello! How are you?",
  "type": "TEXT|IMAGE|GIF|EMOJI|STICKER",
  "attachmentUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "id": 1,
  "matchId": 1,
  "sender": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe"
  },
  "content": "Hello! How are you?",
  "type": "TEXT",
  "attachmentUrl": null,
  "isRead": false,
  "readAt": null,
  "createdAt": "2023-01-01T12:00:00Z"
}
```

#### Get Messages for Match
```http
GET /messages/match/{matchId}/user/{userId}?page=0&size=50
```

**Response:**
```json
[
  {
    "id": 1,
    "matchId": 1,
    "sender": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "content": "Hello! How are you?",
    "type": "TEXT",
    "isRead": true,
    "readAt": "2023-01-01T12:05:00Z",
    "createdAt": "2023-01-01T12:00:00Z"
  }
]
```

#### Mark Messages as Read
```http
POST /messages/match/{matchId}/user/{userId}/read
```

#### Get Unread Message Count
```http
GET /messages/unread/count/{userId}
```

**Response:**
```json
3
```

#### Get Unread Message Count for Match
```http
GET /messages/match/{matchId}/user/{userId}/unread/count
```

#### Get Messages Since
```http
GET /messages/match/{matchId}/user/{userId}/since?since=2023-01-01T12:00:00Z
```

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2023-01-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/auth/register"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2023-01-01T12:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "path": "/api/auth/user/1"
}
```

### 404 Not Found
```json
{
  "timestamp": "2023-01-01T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "User not found",
  "path": "/api/auth/user/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2023-01-01T12:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/discovery/matches/1"
}
```

## Rate Limiting

- Free users: 10 likes per day, 1 super like per day
- Plus users: Unlimited likes, 5 super likes per day
- Gold users: Unlimited likes, 10 super likes per day
- Platinum users: Unlimited likes, 20 super likes per day

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');
```

### Events
- `match_created`: New match notification
- `message_received`: New message notification
- `user_online`: User came online
- `user_offline`: User went offline

### Example Event
```json
{
  "type": "match_created",
  "data": {
    "matchId": 1,
    "user": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```