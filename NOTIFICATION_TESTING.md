# Push Notification Testing Guide

## ✅ Setup Complete!

Your app is now configured for push notifications with:
- **Bundle ID**: `com.pager2077.app`
- **Team ID**: `PQD3HLJC38`
- **iOS Simulator Support**: Yes! (iOS 16+)

## Step 1: Get APNS Credentials (5 minutes)

### Create APNs Auth Key

1. Go to [Apple Developer Portal - Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click **+** to create a new key
3. Name it: "Pager2077 Push Notifications"
4. Check **Apple Push Notifications service (APNs)**
5. Click **Continue** → **Register**
6. **Download the `.p8` file** (you can only download once!)
7. Note the **Key ID** (e.g., `ABC123XYZ`)

### Configure Backend

1. Copy the `.p8` file to a safe location (e.g., `~/apns-keys/`)
2. Create `backend/.env`:

```env
# APNS Configuration
APNS_KEY_PATH=/Users/yourusername/apns-keys/AuthKey_ABC123XYZ.p8
APNS_KEY_ID=ABC123XYZ
APNS_TEAM_ID=PQD3HLJC38
APNS_BUNDLE_ID=com.pager2077.app

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Environment
NODE_ENV=development
```

## Step 2: Build iOS App with Xcode

**Important:** Push notifications require a proper development build with Apple entitlements. Expo Go doesn't support custom push notifications.

### Build Locally with Xcode (FREE)

```bash
cd frontend

# Generate native iOS project
npx expo prebuild --platform ios

# Open in Xcode
open ios/Pager2077.xcworkspace
```

### Configure in Xcode (2 minutes)

1. Select **Pager2077** project → **Signing & Capabilities**
2. Check **"Automatically manage signing"**
3. Select your **Team**: `PQD3HLJC38`
4. Verify **"Push Notifications"** capability is present
5. Click **Play button** (▶️) to build and run

**That's it!** Xcode handles all provisioning automatically.

### Daily Development (Fast)

After building once, use dev client for hot reload:

```bash
cd frontend
npx expo start --dev-client
# Press 'i' for iOS
# Changes appear in ~1 second!
```

See `frontend/LOCAL_BUILD_GUIDE.md` for details.

## Step 3: Test Notifications

### Start Backend Server

```bash
cd backend
bun run dev
```

You should see:
```
✅ Database initialized
✅ Redis connected
✅ APNS Provider initialized (development)
✅ Notification worker started
✅ Server running on http://localhost:3000
```

### Test Flow

1. **Register User 1** (in the app or via curl):
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"deviceToken":"DEVICE_TOKEN_FROM_APP"}'
```

2. **Register User 2** (different device token)

3. **Send Friend Request** (User 1 → User 2):
```bash
curl -X POST http://localhost:3000/api/friends/request \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toHexCode":"USER2_HEX"}'
```

4. **Check User 2's device** - You should see:
   - 📱 Notification: "👋 Friend Request - BC9A408A wants to be friends"

5. **Accept Friend Request** (User 2):
```bash
curl -X POST http://localhost:3000/api/friends/requests/REQUEST_ID/accept \
  -H "Authorization: Bearer USER2_TOKEN"
```

6. **Check User 1's device** - You should see:
   - 📱 Notification: "✅ Friend Request Accepted - 1FB9C081 accepted your request"

7. **Update Status** (User 1):
```bash
curl -X PUT http://localhost:3000/api/users/status \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}'
```

8. **Check User 2's device** - Silent notification (no banner, updates in background)

## Troubleshooting

### "No valid aps-environment entitlement"

**Problem**: Running in Expo Go or without proper build.

**Solution**: Build with Xcode to get proper entitlements.

```bash
cd frontend
npx expo prebuild --platform ios
open ios/Pager2077.xcworkspace
# Configure signing and click Play
```

### "Push notifications require a physical device"

**Solution**: Use iOS 16+ simulator with EAS Build.

```bash
# Check simulator iOS version
xcrun simctl list devices | grep Booted
```

### "APNS credentials not configured"

**Solution**: Check your `.env` file paths are correct and the `.p8` file exists.

### "Permission denied"

**Solution**: In the app, make sure you tap "Allow" when prompted for notification permissions.

### "No notification received"

**Checklist**:
- ✅ Backend server running
- ✅ Redis running (`redis-cli ping` returns `PONG`)
- ✅ APNS credentials configured
- ✅ App has notification permissions
- ✅ Device token registered with backend
- ✅ Check backend logs for "Notification sent successfully"

### Check Queue Status

```bash
curl http://localhost:3000/api/queue/metrics
```

Should show:
```json
{
  "success": true,
  "data": {
    "waiting": 0,
    "active": 0,
    "completed": 3,
    "failed": 0
  }
}
```

## Notification Types

### Alert Notifications (with sound & banner)
- **Voice Note**: "📟 New Voice Note from {hexCode}"
- **Friend Request**: "👋 {hexCode} wants to be friends"
- **Friend Accepted**: "✅ {hexCode} accepted your request"

### Silent Notifications (background only)
- **Friend Status**: Updates friend online/offline status

## iOS Simulator Support

Yes! iOS Simulator supports push notifications since iOS 16:
- ✅ Alert notifications with sound
- ✅ Silent notifications
- ✅ Badge updates
- ✅ Notification center
- ✅ Lock screen notifications

**But requires:** Proper development build with EAS (not Expo Go)

## Next Steps

Once notifications are working:
1. Implement voice note notifications
2. Add notification sound customization
3. Handle notification taps (navigate to specific screens)
4. Add notification preferences
5. Test on physical device
6. Prepare for production (TestFlight/App Store)

## Production Checklist

Before going to production:
- [ ] Get production APNS certificate
- [ ] Set `NODE_ENV=production` in backend
- [ ] Test with TestFlight build
- [ ] Implement notification analytics
- [ ] Add error monitoring (Sentry)
- [ ] Set up notification rate limiting
- [ ] Configure Redis persistence


---

## Live Activity Token Flow

### Understanding the Two Token Types

Pager2077 uses **two different types of push tokens** for iOS notifications. Understanding the difference is critical for debugging Live Activity issues.

| Token Type | Field Name | Purpose | iOS Version | APNS Topic |
|------------|------------|---------|-------------|------------|
| **Device Token** | `device_token` | Regular push notifications (alerts, badges, sounds) | iOS 10+ | `com.pager2077.app` |
| **Push-to-Start Token** | `live_activity_token` | Remotely start Live Activities on lock screen | iOS 17.2+ | `com.pager2077.app.push-type.liveactivity` |

### Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LIVE ACTIVITY TOKEN FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   iOS Device     │     │   Backend API    │     │   APNS Server    │
│   (Frontend)     │     │                  │     │                  │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │  Step 1: Get Token     │                        │
         │  from ActivityKit      │                        │
         │  ─────────────────►    │                        │
         │  pushToStartTokenUpdates                        │
         │                        │                        │
         │  Step 2: Token         │                        │
         │  returned to JS        │                        │
         │  ◄─────────────────    │                        │
         │                        │                        │
         │  Step 3: Send to       │                        │
         │  backend               │                        │
         │  ─────────────────────►│                        │
         │  PUT /api/users/       │                        │
         │  live-activity-token   │                        │
         │                        │                        │
         │  Step 4: Store in      │                        │
         │  live_activity_token   │                        │
         │  ◄─────────────────────│                        │
         │  (NOT device_token!)   │                        │
         │                        │                        │
         │                        │  Step 5: When message  │
         │                        │  received, use LA token│
         │                        │  ─────────────────────►│
         │                        │  Topic: bundleId.      │
         │                        │  push-type.liveactivity│
         │                        │                        │
         │  Step 6: Live Activity │                        │
         │  appears on lock screen│◄─────────────────────  │
         │                        │                        │
         ▼                        ▼                        ▼
```

### iOS Version Requirements

| Feature | Minimum iOS Version | Notes |
|---------|---------------------|-------|
| Live Activities (local) | iOS 16.1 | Start activities from within the app |
| Push-to-Start Token | iOS 17.2 | Remotely start activities via push |
| Frequent Updates | iOS 17.2 | More frequent push updates allowed |

### APNS Configuration for Live Activities

When sending a Live Activity push-to-start notification, the backend must use:

```
Topic:     com.pager2077.app.push-type.liveactivity
Push-Type: liveactivity
Priority:  10 (immediate)
```

**NOT** the regular push configuration:
```
Topic:     com.pager2077.app
Push-Type: alert
```

### Push-to-Start Payload Format

```json
{
  "aps": {
    "timestamp": 1705312200,
    "event": "start",
    "content-state": {
      "sender": "FRIEND123",
      "message": "Hello from the pager!",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "isDemo": false,
      "messageIndex": 1,
      "totalMessages": 1
    },
    "alert": {
      "title": "FRIEND123",
      "body": "Hello from the pager!"
    },
    "sound": "default"
  },
  "attributes-type": "PagerActivityAttributes",
  "attributes": {
    "activityType": "message"
  }
}
```

### Key Fields Explained

| Field | Required | Description |
|-------|----------|-------------|
| `aps.timestamp` | Yes | Unix timestamp (seconds) when notification was issued |
| `aps.event` | Yes | Must be `"start"` for push-to-start |
| `aps.content-state` | Yes | Dynamic data displayed in the Live Activity |
| `attributes-type` | Yes | Must match Swift struct name: `PagerActivityAttributes` |
| `attributes` | Yes | Static data for the activity |

### Debugging Token Flow

Look for these log messages in the console:

**Frontend (iOS/React Native):**
```
[LA TOKEN FLOW] Step 1: Starting push-to-start token retrieval from ActivityKit
[LA TOKEN FLOW] Step 2: TypeScript requesting push-to-start token from native bridge
[LA TOKEN FLOW] Step 3: Registering push-to-start token with backend
[LA TOKEN FLOW] Step 4: Sending push-to-start token to backend API
```

**Backend:**
```
[LA TOKEN FLOW] Step 5: Preparing Live Activity notification
[LA TOKEN FLOW] Step 6: Sending Live Activity push-to-start via APNS
```

### Common Issues

#### 1. "No push-to-start token available"

**Cause:** iOS version < 17.2 or Live Activities disabled

**Solution:**
- Check iOS version: Settings → General → About
- Enable Live Activities: Settings → Pager2077 → Live Activities

#### 2. "BadDeviceToken" from APNS

**Cause:** Using device token instead of push-to-start token, or token expired

**Solution:**
- Verify backend uses `liveActivityToken` field (not `deviceToken`)
- Check token was obtained from `pushToStartTokenUpdates` (not device token API)
- Re-register token on app foreground

#### 3. "DeviceTokenNotForTopic" from APNS

**Cause:** Using wrong APNS topic

**Solution:**
- Verify topic is `{bundleId}.push-type.liveactivity`
- Verify push-type is `liveactivity` (not `alert`)

#### 4. Live Activity doesn't appear

**Cause:** Widget extension not properly configured

**Solution:**
- Verify `PagerActivityAttributes` struct matches in both:
  - `frontend/ios/Pager2077/LiveActivityBridge.swift`
  - `frontend/ios/liveactivity/liveactivityLiveActivity.swift`
- Check widget extension is included in build

### Testing Live Activity Notifications

#### Prerequisites

1. **Physical iOS device** with iOS 17.2 or later (simulator does not support push-to-start)
2. **Live Activities enabled** in device settings: Settings → Pager2077 → Live Activities
3. **Backend running** with valid APNS credentials
4. **Two registered users** (sender and recipient)

#### Step-by-Step Testing

1. **Verify iOS version** on physical device:
   - Settings → General → About → iOS Version
   - Must be 17.2 or later for push-to-start

2. **Enable Live Activities** in device settings:
   - Settings → Pager2077 → Live Activities → ON

3. **Launch the app** and check token registration in backend logs:
   ```
   [LA TOKEN FLOW] Step 1: Starting push-to-start token retrieval from ActivityKit
   [LA TOKEN FLOW] ✅ SUCCESS: Push-to-start token obtained from ActivityKit
   [LA TOKEN FLOW] Token Preview: abc123def456...
   ```

4. **Verify token stored in backend**:
   ```bash
   # Check user has Live Activity token
   curl http://localhost:3000/api/users/me \
     -H "Authorization: Bearer RECIPIENT_TOKEN"
   ```
   Response should include `liveActivityToken` field (not null).

5. **Send a test message** from another user:
   ```bash
   curl -X POST http://localhost:3000/api/messages \
     -H "Authorization: Bearer SENDER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"recipientId":"RECIPIENT_USER_ID","text":"Hello from the pager!"}'
   ```

6. **Check backend logs** for successful delivery:
   ```
   [LA TOKEN FLOW] Step 5: Preparing Live Activity notification
   [LA TOKEN FLOW] ✅ Valid Live Activity token found
   [LA TOKEN FLOW] Using: liveActivityToken (NOT deviceToken)
   [APNS PAYLOAD] Sending Live Activity push-to-start notification
   [APNS PAYLOAD] Topic: com.pager2077.app.push-type.liveactivity
   [APNS PAYLOAD] Push-Type: liveactivity
   [APNS PAYLOAD] ✅ Live Activity push-to-start sent successfully
   ```

7. **Verify on device**:
   - Lock the device
   - Live Activity should appear on lock screen with:
     - Sender name (e.g., "FRIEND123")
     - Message text (e.g., "HELLO FROM THE PAGER!")
     - Timestamp
     - Retro LCD green background with scanlines

#### Expected Live Activity Display

The Live Activity should show:
- **Header**: Message index and sender name (e.g., "01: FRIEND123")
- **Body**: Message text in uppercase
- **Footer**: Time and date
- **Style**: Retro LCD green background (#8B9D7F) with scanline effect

#### Troubleshooting

If Live Activity doesn't appear:

1. **Check iOS version**: Must be 17.2+
2. **Check Live Activities enabled**: Settings → Pager2077 → Live Activities
3. **Check token registration**: Look for `[LA TOKEN FLOW] ✅ SUCCESS` in logs
4. **Check APNS response**: Look for `[APNS PAYLOAD] ✅ Live Activity push-to-start sent successfully`
5. **Check for errors**: Look for `BadDeviceToken`, `Unregistered`, or `DeviceTokenNotForTopic`

If you see `BadDeviceToken` or `Unregistered`:
- The push-to-start token may have expired
- Force quit the app and relaunch to get a new token
- Check that the token is being stored in `live_activity_token` (not `device_token`)

If you see `DeviceTokenNotForTopic`:
- The APNS topic is incorrect
- Should be `com.pager2077.app.push-type.liveactivity`
- Check `APNS_BUNDLE_ID` in backend `.env`

### Database Schema

The `users` table stores both token types separately:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  hex_code TEXT UNIQUE NOT NULL,
  device_token TEXT,           -- Regular APNS push token
  live_activity_token TEXT,    -- Push-to-start token (iOS 17.2+)
  -- ... other fields
);
```

**Important:** Never confuse these two fields! They serve completely different purposes.
