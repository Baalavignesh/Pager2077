#!/bin/bash

# Pager2077 Notification Test Script

echo "🧪 Testing Pager2077 Notification System"
echo "========================================"
echo ""

# Check if server is running
echo "1️⃣  Checking if server is running..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start it with: cd backend && bun run dev"
    exit 1
fi

# Check Redis
echo ""
echo "2️⃣  Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Start it with: brew services start redis"
    exit 1
fi

# Check queue metrics
echo ""
echo "3️⃣  Checking notification queue..."
METRICS=$(curl -s http://localhost:3000/api/queue/metrics)
echo "Queue Status: $METRICS"

# Register test users
echo ""
echo "4️⃣  Registering test users..."

USER1=$(curl -s -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"deviceToken":"test-device-1"}')

USER1_ID=$(echo $USER1 | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
USER1_HEX=$(echo $USER1 | grep -o '"hexCode":"[^"]*' | cut -d'"' -f4)
USER1_TOKEN=$(echo $USER1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "✅ User 1: $USER1_HEX"

USER2=$(curl -s -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"deviceToken":"test-device-2"}')

USER2_ID=$(echo $USER2 | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
USER2_HEX=$(echo $USER2 | grep -o '"hexCode":"[^"]*' | cut -d'"' -f4)
USER2_TOKEN=$(echo $USER2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "✅ User 2: $USER2_HEX"

# Send friend request
echo ""
echo "5️⃣  Sending friend request from $USER1_HEX to $USER2_HEX..."

REQUEST=$(curl -s -X POST http://localhost:3000/api/friends/request \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"toHexCode\":\"$USER2_HEX\"}")

REQUEST_ID=$(echo $REQUEST | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "✅ Friend request sent (ID: $REQUEST_ID)"
echo "📬 Notification queued for User 2"

# Accept friend request
echo ""
echo "6️⃣  Accepting friend request..."

curl -s -X POST "http://localhost:3000/api/friends/requests/$REQUEST_ID/accept" \
  -H "Authorization: Bearer $USER2_TOKEN" > /dev/null

echo "✅ Friend request accepted"
echo "📬 Notification queued for User 1"

# Update status
echo ""
echo "7️⃣  Updating User 1 status to online..."

curl -s -X PUT http://localhost:3000/api/users/status \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"online"}' > /dev/null

echo "✅ Status updated"
echo "📬 Silent notification queued for User 2"

# Check final queue metrics
echo ""
echo "8️⃣  Final queue metrics..."
FINAL_METRICS=$(curl -s http://localhost:3000/api/queue/metrics)
echo "$FINAL_METRICS"

echo ""
echo "✅ Test complete!"
echo ""
echo "Check your backend logs to see the notifications being processed."
echo "If APNS is configured, notifications were sent to devices."
echo "If not configured, notifications were mocked (logged to console)."
