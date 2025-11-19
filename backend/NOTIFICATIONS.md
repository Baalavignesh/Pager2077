# Notification System Architecture

Inspired by Apollo Server's notification delivery system, built with Redis queue and APNS.

## Architecture Overview

```
┌─────────────────┐
│  API Endpoint   │
│  (Event)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notification    │
│ Service         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis Queue    │
│  (BullMQ)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Queue Worker   │
│  (10 concurrent)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  APNS Provider  │
│  (HTTP/2)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  iOS Device     │
└─────────────────┘
```

## Components

### 1. APNS Provider (`APNSProvider.ts`)
- Maintains persistent HTTP/2 connection to Apple's servers
- Handles both alert and silent notifications
- Certificate-based authentication
- Automatic retry on failure

### 2. Redis Queue (`notificationQueue.ts`)
- BullMQ for reliable job processing
- Exponential backoff retry (3 attempts)
- Rate limiting: 100 notifications/second
- Concurrency: 10 workers
- Priority: Alert > Silent

### 3. Notification Service (`NotificationService.ts`)
- High-level API for sending notifications
- Queues notifications for async processing
- Supports multiple notification types

### 4. Queue Worker
- Processes notifications from Redis queue
- Handles failures with automatic retry
- Logs all events (completed, failed, error)

## Notification Types

### Alert Notifications (with sound)
- **Voice Note Received**: "📟 New Voice Note from {hexCode}"
- **Friend Request**: "👋 {hexCode} wants to be friends"
- **Friend Accepted**: "✅ {hexCode} accepted your request"

### Silent Notifications (background)
- **Friend Status Changed**: Updates friend online/offline status

## Setup

### 1. Install Redis

```bash
# macOS
brew install redis
brew services start redis

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### 2. Configure APNS Credentials

Create a `.env` file:

```env
# APNS Configuration
APNS_KEY_PATH=/path/to/AuthKey_XXXXXXXXXX.p8
APNS_KEY_ID=XXXXXXXXXX
APNS_TEAM_ID=XXXXXXXXXX
APNS_BUNDLE_ID=com.pager2077.app

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Environment
NODE_ENV=development
```

### 3. Get APNS Credentials

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Create a new key with "Apple Push Notifications service (APNs)" enabled
3. Download the `.p8` file
4. Note the Key ID and Team ID

## Usage

### Send Alert Notification

```typescript
await notificationService.notifyVoiceNoteReceived(
  recipient,
  senderHexCode,
  voiceNoteId
);
```

### Send Silent Notification

```typescript
await notificationService.notifyFriendStatusChanged(
  recipient,
  friendHexCode,
  'online'
);
```

### Broadcast to Multiple Users

```typescript
await notificationService.broadcastStatusToFriends(
  friends,
  userHexCode,
  'offline'
);
```

## Monitoring

### Queue Metrics Endpoint

```bash
GET /api/queue/metrics
```

Response:
```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 1234,
    "failed": 3
  }
}
```

### Logs

The system logs all notification events:
- `📥 Queued {type} notification for user {userId}`
- `📤 Processing {type} notification for user {userId}`
- `✅ Notification sent successfully`
- `❌ Notification failed`

## Error Handling

### Automatic Retry
- Failed notifications are retried up to 3 times
- Exponential backoff: 2s, 4s, 8s
- Failed jobs kept for 24 hours for debugging

### Rate Limiting
- Max 100 notifications per second
- Prevents overwhelming APNS servers
- Queues excess notifications

### Invalid Device Tokens
- APNS returns error for invalid tokens
- Worker logs the error
- Job marked as failed (no retry)

## Testing

### Mock Mode
If APNS credentials are not configured, the system runs in mock mode:
- Notifications are logged to console
- No actual APNS calls made
- Useful for local development

### Test Notification

```bash
# Send friend request (triggers notification)
curl -X POST http://localhost:3000/api/friends/request \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"toHexCode":"ABCD1234"}'

# Update status (triggers silent notification to friends)
curl -X PUT http://localhost:3000/api/users/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'
```

## Performance

### Throughput
- **Queue**: Handles 1000+ jobs/second
- **APNS**: Limited by Apple (100/second recommended)
- **Worker**: 10 concurrent jobs

### Latency
- **Queue Add**: < 5ms
- **Processing**: 50-200ms per notification
- **Total**: < 500ms from event to device

## Future Enhancements

- [ ] Add FCM support for Android
- [ ] Implement notification preferences per user
- [ ] Add notification history/inbox
- [ ] Support notification grouping
- [ ] Add analytics and metrics dashboard
- [ ] Implement notification scheduling
