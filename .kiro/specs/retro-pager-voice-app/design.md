# Design Document

## Overview

The Retro Pager Voice App is a full-stack mobile application consisting of a React Native frontend and an AWS serverless backend. The architecture emphasizes simplicity, real-time communication, and temporary data storage. The system uses a monorepo structure with separate `frontend/` and `backend/` directories in the same parent folder.

## Project Structure

```
retro-pager-voice-app/
├── frontend/                 # React Native mobile app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # Main Pager screen
│   │   ├── services/        # API client, audio, notifications
│   │   ├── hooks/           # Custom React hooks
│   │   ├── theme/           # Retro styling and theme
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── app.json
│
└── backend/                  # AWS serverless backend
    ├── src/
    │   ├── handlers/        # Lambda function handlers
    │   ├── services/        # Business logic layer
    │   ├── repositories/    # Database access layer
    │   ├── models/          # TypeScript interfaces/types
    │   └── utils/           # Helper functions
    ├── terraform/           # Infrastructure as Code
    │   ├── main.tf
    │   ├── api-gateway.tf
    │   ├── lambda.tf
    │   ├── rds.tf
    │   ├── s3.tf
    │   └── sns.tf
    ├── package.json
    └── bun.lockb
```

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Bun Server    │
│   (Singleton)   │
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
    ┌────────┐    ┌──────────────┐
    │ SQLite │    │ S3-Compatible│
    │  File  │    │   Storage    │
    └────────┘    └──────────────┘
         │
         ▼
    ┌─────────┐
    │  APNS   │
    │  Push   │
    └─────────┘
```

### Communication Flow

1. **User Registration**: App → Bun Server → SQLite (generate hex code)
2. **Friend Request**: App → Bun Server → SQLite → APNS (notify recipient)
3. **Voice Upload**: App → Bun Server → S3-Compatible Storage (presigned URL) → SQLite (metadata)
4. **Voice Delivery**: Bun Server → APNS → Device → App (auto-play)
5. **Status Updates**: App → Bun Server → SQLite → APNS (notify friends)

## Components and Interfaces

### Frontend Components

#### 1. PagerScreen (Main Screen)
- **Purpose**: Single-screen container for entire app
- **Children**: HexCodeDisplay, FriendRequestList, FriendList, VoiceControls
- **State Management**: React Context for user data, friends, recording state

#### 2. HexCodeDisplay
- **Purpose**: Show user's hex code with tap-to-copy
- **Props**: `hexCode: string`
- **Features**: Clipboard API integration, visual feedback on copy

#### 3. FriendRequestList
- **Purpose**: Display pending incoming friend requests
- **Props**: `requests: FriendRequest[]`, `onAccept: (id) => void`, `onReject: (id) => void`
- **UI**: Collapsible section, shows count badge

#### 4. FriendList
- **Purpose**: Scrollable picker-style friend selector
- **Props**: `friends: Friend[]`, `selectedFriend: Friend | null`, `onSelect: (friend) => void`
- **UI**: iOS alarm-style scroll picker with online/offline indicators
- **Library**: Custom implementation with React Native Reanimated

#### 5. VoiceControls
- **Purpose**: Recording and playback controls
- **States**:
  - Idle: Large "TALK" button (disabled if no friend selected)
  - Recording: "STOP" button with duration indicator
  - Recorded: Three buttons (CLEAR, PLAY, SEND)
- **Props**: `selectedFriend: Friend | null`, `onSend: (audio) => void`

#### 6. AddFriendModal
- **Purpose**: Input modal for entering friend hex codes
- **Props**: `visible: boolean`, `onSubmit: (hexCode) => void`, `onClose: () => void`
- **Validation**: 8-character hex format

### Backend Services

#### 1. UserService
```typescript
interface UserService {
  registerUser(deviceToken: string): Promise<User>
  getUserByHexCode(hexCode: string): Promise<User | null>
  updateUserStatus(userId: string, status: 'online' | 'offline'): Promise<void>
  getUserFriends(userId: string): Promise<Friend[]>
}
```

#### 2. FriendshipService
```typescript
interface FriendshipService {
  sendFriendRequest(fromUserId: string, toHexCode: string): Promise<FriendRequest>
  getPendingRequests(userId: string): Promise<FriendRequest[]>
  acceptFriendRequest(requestId: string): Promise<Friendship>
  rejectFriendRequest(requestId: string): Promise<void>
}
```

#### 3. VoiceNoteService
```typescript
interface VoiceNoteService {
  generateUploadUrl(userId: string, recipientId: string): Promise<PresignedUrl>
  processVoiceNote(voiceNoteId: string): Promise<void>
  generateDownloadUrl(voiceNoteId: string): Promise<string>
  notifyRecipient(recipientId: string, voiceNoteId: string): Promise<void>
}

// Uses S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
```

#### 4. NotificationService
```typescript
interface NotificationService {
  sendAPNSNotification(deviceToken: string, payload: APNSPayload): Promise<void>
  sendSilentNotification(deviceToken: string, data: any): Promise<void>
  registerDevice(userId: string, deviceToken: string): Promise<void>
}
```

## Data Models

### Database Schema (SQLite)

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  hex_code TEXT UNIQUE NOT NULL,
  device_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'offline',
  last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_hex_code ON users(hex_code);
CREATE INDEX idx_users_device_token ON users(device_token);
CREATE INDEX idx_users_status ON users(status);
```

#### Friend Requests Table
```sql
CREATE TABLE friend_requests (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_friend_requests_to_user ON friend_requests(to_user_id, status);
CREATE INDEX idx_friend_requests_from_user ON friend_requests(from_user_id);
```

#### Friendships Table
```sql
CREATE TABLE friendships (
  id TEXT PRIMARY KEY,
  user_id_1 TEXT NOT NULL,
  user_id_2 TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
```

#### Voice Notes Table
```sql
CREATE TABLE voice_notes (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  played_at TEXT,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_voice_notes_recipient ON voice_notes(recipient_id, status);
CREATE INDEX idx_voice_notes_expires ON voice_notes(expires_at);
```

### TypeScript Interfaces

#### Frontend Types
```typescript
interface User {
  id: string
  hexCode: string
  status: 'online' | 'offline'
}

interface Friend {
  id: string
  hexCode: string
  status: 'online' | 'offline'
  friendshipId: string
}

interface FriendRequest {
  id: string
  fromUser: {
    id: string
    hexCode: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

interface VoiceNote {
  id: string
  senderId: string
  recipientId: string
  downloadUrl: string
  durationSeconds: number
  createdAt: string
}

interface RecordingState {
  isRecording: boolean
  hasRecording: boolean
  audioUri: string | null
  durationSeconds: number
}
```

## API Design

### REST Endpoints

#### User Management
```
POST   /api/users/register
Body: { deviceToken: string }
Response: { userId: string, hexCode: string }

GET    /api/users/me
Headers: { Authorization: Bearer <token> }
Response: { id: string, hexCode: string, status: string }

PUT    /api/users/status
Body: { status: 'online' | 'offline' }
Response: { success: boolean }
```

#### Friendship Management
```
POST   /api/friends/request
Body: { toHexCode: string }
Response: { requestId: string, status: string }

GET    /api/friends/requests/pending
Response: { requests: FriendRequest[] }

POST   /api/friends/requests/:requestId/accept
Response: { friendshipId: string, friend: Friend }

POST   /api/friends/requests/:requestId/reject
Response: { success: boolean }

GET    /api/friends
Response: { friends: Friend[] }
```

#### Voice Notes
```
POST   /api/voice-notes/upload-url
Body: { recipientId: string, durationSeconds: number }
Response: { uploadUrl: string, voiceNoteId: string }

POST   /api/voice-notes/:id/complete
Response: { success: boolean }

GET    /api/voice-notes/:id/download-url
Response: { downloadUrl: string }
```

### Authentication

- Use JWT tokens stored in secure storage (React Native Keychain)
- Token generated on user registration
- Include in Authorization header for all authenticated requests
- Token payload: `{ userId: string, hexCode: string, iat: number, exp: number }`

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Show toast message "Connection lost. Retrying..."
2. **API Errors**: Display user-friendly messages based on error codes
3. **Recording Errors**: Show "Microphone access denied" with settings link
4. **Playback Errors**: Show "Unable to play voice note" with retry option

### Backend Error Handling

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message)
  }
}

// Error codes
const ErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_HEX_CODE: 'INVALID_HEX_CODE',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  FRIENDSHIP_EXISTS: 'FRIENDSHIP_EXISTS',
  VOICE_NOTE_EXPIRED: 'VOICE_NOTE_EXPIRED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED'
}
```

### Lambda Error Response Format
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Testing Strategy

### Frontend Testing

1. **Unit Tests** (Jest + React Native Testing Library)
   - Component rendering and props
   - Custom hooks logic
   - Utility functions
   - Audio service methods

2. **Integration Tests**
   - API client with mocked responses
   - Recording flow (mock audio APIs)
   - Friend selection and voice sending flow

3. **E2E Tests** (Detox - Optional)
   - Complete user journey: register → add friend → send voice note
   - Friend request accept/reject flow

### Backend Testing

1. **Unit Tests** (Bun test)
   - Service layer business logic
   - Repository CRUD operations
   - Utility functions
   - Hex code generation

2. **Integration Tests**
   - API endpoints with test database
   - S3 upload/download operations
   - APNS notification sending (mocked)

3. **API Tests**
   - Endpoint response validation
   - Authentication middleware
   - Error handling scenarios

## Retro UI Design System

### Color Palette (Monochrome)
```typescript
const theme = {
  colors: {
    background: '#C7D3C0',      // Pager LCD green-gray
    foreground: '#1A1A1A',      // Dark text/borders
    accent: '#2D4A2B',          // Darker green for highlights
    disabled: '#8B9B88',        // Muted for inactive states
    online: '#2D4A2B',          // Online indicator
    offline: '#5A5A5A'          // Offline indicator
  }
}
```

### Typography
```typescript
const fonts = {
  primary: 'PressStart2P',      // Pixel font for main text
  mono: 'CourierPrime',         // Monospace for hex codes
  sizes: {
    small: 10,
    medium: 14,
    large: 18,
    xlarge: 24
  }
}
```

### Component Styling Patterns

1. **Buttons**: 4px border, sharp corners, 16px padding, uppercase text
2. **Containers**: 2px border, no border radius, 8px padding
3. **Text**: Pixelated font, high contrast, no anti-aliasing effect
4. **Spacing**: 8px grid system (8, 16, 24, 32px)

### Animation Guidelines

- Use stepped animations (no smooth easing)
- Button press: scale(0.95) with no transition
- Loading states: pixelated spinner or blinking text
- Scroll: snap to items (no momentum scrolling)

## Performance Considerations

### Frontend Optimization

1. **Audio Handling**: Use native modules for recording/playback (react-native-audio-recorder-player)
2. **List Rendering**: Virtualize friend list if > 50 friends
3. **Image Optimization**: Use vector icons for retro aesthetic
4. **State Management**: React Context for global state, local state for UI

### Backend Optimization

1. **Database Indexing**: Indexes on hex_code, device_token, user relationships
2. **Object Storage Lifecycle**: Auto-delete voice files after 48 hours (bucket policy)
3. **SQLite**: Use WAL mode for better concurrent read performance
4. **APNS Connection**: Maintain persistent HTTP/2 connection for efficiency
5. **S3-Compatible Storage**: Use provider-agnostic client (supports AWS S3, Cloudflare R2, MinIO, etc.)

### Scalability Considerations

1. **Database**: SQLite works well for single-server; consider PostgreSQL for multi-server
2. **Server**: Single Bun instance; can add load balancer + multiple instances later
3. **S3**: Unlimited storage; use CloudFront CDN if global distribution needed
4. **APNS**: HTTP/2 multiplexing handles high throughput efficiently

## Security

### Frontend Security

1. **Secure Storage**: Use react-native-keychain for JWT tokens
2. **API Communication**: HTTPS only, certificate pinning (optional)
3. **Permissions**: Request microphone permission with clear explanation
4. **Input Validation**: Sanitize hex code inputs

### Backend Security

1. **Authentication**: JWT with short expiration (7 days), refresh token flow
2. **Authorization**: Verify user owns resources before operations
3. **Object Storage Security**: Presigned URLs with 5-minute expiration
4. **Database**: Parameterized queries to prevent SQL injection
5. **Rate Limiting**: Implement middleware (100 requests/minute per user)
6. **APNS**: Secure certificate-based authentication
7. **Provider Agnostic**: S3-compatible client works with any provider (AWS S3, Cloudflare R2, MinIO)

### Data Privacy

1. **Voice Notes**: Auto-delete after 48 hours
2. **User Data**: Minimal collection (no email, phone, name)
3. **Device Tokens**: Stored securely in SQLite
4. **Logs**: No PII in server logs

## Deployment Strategy

### Frontend Deployment

1. **Development**: Local Xcode build (required for push notifications)
   - Expo Go doesn't support custom push notifications
   - Xcode build provides proper Apple entitlements
   - Works on iOS Simulator (iOS 16+)
   - Use dev client for fast hot reload after initial build
2. **Staging**: TestFlight (iOS) / Internal Testing (Android)
3. **Production**: App Store / Google Play Store

### Backend Deployment

1. **Development**: Local Bun server with SQLite file
2. **Production**: Manual deployment (handled separately)

### CI/CD Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Lint   │────▶│   Test   │────▶│  Build   │────▶│  Deploy  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

1. **Lint**: ESLint + Prettier for code quality
2. **Test**: Run unit + integration tests
3. **Build**: Xcode build for frontend (with entitlements), compile TypeScript for backend
4. **Deploy**: TestFlight/App Store (frontend), manual deployment (backend)

## Future Extensibility

The database schema and architecture support future features:

1. **Group Messaging**: Add `groups` and `group_members` tables
2. **Message History**: Remove auto-delete, add `message_history` table
3. **Read Receipts**: Add `read_at` column to voice_notes
4. **User Profiles**: Add `profiles` table with avatars, display names
5. **Blocking**: Add `blocked_users` table
6. **Voice Effects**: Store effect metadata in voice_notes table
7. **Multiple Devices**: Add `devices` table, link to users

The modular service architecture allows adding new features without refactoring existing code.
