# Zenni Dating App API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication (`/api/auth`)

#### POST `/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-01-01",
  "gender": "male"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST `/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST `/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### POST `/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

### Users (`/api/users`)

#### GET `/profile`
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-01-01",
  "gender": "male",
  "bio": "Love hiking and coffee",
  "locationLat": 40.7128,
  "locationLng": -74.0060,
  "locationCity": "New York",
  "locationCountry": "USA",
  "isVerified": true,
  "photos": [
    {
      "id": "uuid",
      "photo_url": "https://example.com/photo.jpg",
      "is_primary": true,
      "order_index": 0
    }
  ],
  "preferences": {
    "min_age": 18,
    "max_age": 35,
    "max_distance": 50,
    "interested_in": "female",
    "show_me": "everyone"
  }
}
```

#### PUT `/profile`
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "locationLat": 40.7128,
  "locationLng": -74.0060,
  "locationCity": "New York",
  "locationCountry": "USA"
}
```

#### POST `/photos`
Upload user photo.

**Request:** Multipart form data with `photo` file

**Response:**
```json
{
  "message": "Photo uploaded successfully",
  "photo": {
    "id": "uuid",
    "photo_url": "https://example.com/photo.jpg",
    "is_primary": false,
    "order_index": 1
  }
}
```

#### PUT `/photos/:photoId/primary`
Set photo as primary.

#### DELETE `/photos/:photoId`
Delete photo.

#### PUT `/preferences`
Update user preferences.

**Request Body:**
```json
{
  "minAge": 18,
  "maxAge": 35,
  "maxDistance": 50,
  "interestedIn": "female",
  "showMe": "verified"
}
```

#### GET `/discover`
Get potential matches for swiping.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10)
- `offset` (optional): Number of users to skip (default: 0)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "dateOfBirth": "1998-05-15",
      "gender": "female",
      "bio": "Love traveling and photography",
      "locationCity": "New York",
      "isVerified": true,
      "photos": [...]
    }
  ],
  "hasMore": true
}
```

### Matches (`/api/matches`)

#### POST `/swipe`
Swipe on a user.

**Request Body:**
```json
{
  "swipedId": "user-uuid",
  "action": "like" // "like", "pass", or "super_like"
}
```

**Response:**
```json
{
  "message": "Swipe recorded successfully",
  "isMatch": true,
  "action": "like"
}
```

#### GET `/`
Get all matches.

**Query Parameters:**
- `limit` (optional): Number of matches to return (default: 20)
- `offset` (optional): Number of matches to skip (default: 0)

**Response:**
```json
{
  "matches": [
    {
      "match_id": "uuid",
      "matched_at": "2024-01-15T10:30:00Z",
      "last_message_at": "2024-01-15T14:20:00Z",
      "matched_user_id": "uuid",
      "matched_user_name": "Jane",
      "matched_user_last_name": "Smith",
      "matched_user_verified": true,
      "matched_user_photo": "https://example.com/photo.jpg",
      "photos": [...]
    }
  ],
  "hasMore": false
}
```

#### GET `/:matchId`
Get specific match details.

#### DELETE `/:matchId`
Unmatch a user.

#### GET `/stats/swipes`
Get swipe statistics.

**Response:**
```json
{
  "todaySwipes": 15,
  "totalSwipes": 150,
  "totalLikes": 45,
  "todaySuperLikes": 1,
  "totalMatches": 8
}
```

### Messages (`/api/messages`)

#### GET `/:matchId`
Get messages for a match.

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "Hey! How are you?",
      "message_type": "text",
      "is_read": true,
      "created_at": "2024-01-15T14:20:00Z",
      "sender_name": "John",
      "sender_id": "uuid"
    }
  ],
  "hasMore": false
}
```

#### POST `/:matchId`
Send a message.

**Request Body:**
```json
{
  "content": "Hello! Nice to meet you!",
  "messageType": "text" // "text", "image", "gif", or "emoji"
}
```

#### PUT `/:matchId/read`
Mark messages as read.

#### GET `/unread/count`
Get unread message count.

**Response:**
```json
{
  "unreadCount": 5
}
```

#### GET `/conversations/recent`
Get recent conversations.

**Response:**
```json
{
  "conversations": [
    {
      "match_id": "uuid",
      "last_message_at": "2024-01-15T14:20:00Z",
      "matched_user_id": "uuid",
      "matched_user_name": "Jane",
      "matched_user_last_name": "Smith",
      "matched_user_photo": "https://example.com/photo.jpg",
      "last_message": "Hey! How are you?",
      "last_message_type": "text",
      "last_message_created_at": "2024-01-15T14:20:00Z",
      "last_message_sender_id": "uuid",
      "unread_count": 2
    }
  ]
}
```

### Premium Features (`/api/premium`)

#### GET `/subscription`
Get current subscription status.

**Response:**
```json
{
  "hasSubscription": true,
  "plan": {
    "type": "gold",
    "status": "active",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-02-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET `/features`
Get available premium features.

**Response:**
```json
{
  "plan": "gold",
  "features": {
    "dailyLikes": -1,
    "dailySuperLikes": 5,
    "canRewind": true,
    "canSeeWhoLiked": true,
    "canPassport": true,
    "canBoost": true,
    "canMessageBeforeMatch": false,
    "canSeeReadReceipts": true,
    "adFree": true
  }
}
```

#### GET `/likes-you`
Get who liked you (Gold/Platinum feature).

#### POST `/rewind`
Use rewind feature (Plus/Gold/Platinum).

#### POST `/boost`
Activate boost feature.

#### GET `/top-picks`
Get top picks (Gold/Platinum feature).

#### POST `/super-likes/purchase`
Purchase additional super likes.

**Request Body:**
```json
{
  "quantity": 5
}
```

#### GET `/pricing`
Get pricing information.

### Safety (`/api/safety`)

#### POST `/report`
Report a user.

**Request Body:**
```json
{
  "reportedId": "user-uuid",
  "reason": "inappropriate_photos",
  "description": "Optional description"
}
```

#### POST `/block`
Block a user.

**Request Body:**
```json
{
  "blockedId": "user-uuid"
}
```

#### DELETE `/block/:blockedId`
Unblock a user.

#### GET `/blocked`
Get blocked users list.

#### GET `/settings`
Get safety settings.

#### PUT `/settings`
Update safety settings.

#### GET `/guidelines`
Get community guidelines.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "retryAfter": 900
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Swiping: 60 requests per minute

## WebSocket Events

### Connection
Connect with JWT token in auth:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### `join_room`
Join a chat room (match ID).
```javascript
socket.emit('join_room', matchId);
```

#### `send_message`
Send a message.
```javascript
socket.emit('send_message', {
  roomId: matchId,
  content: 'Hello!',
  messageType: 'text'
});
```

#### `receive_message`
Receive a message.
```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error