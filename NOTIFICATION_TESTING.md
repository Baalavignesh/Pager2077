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
