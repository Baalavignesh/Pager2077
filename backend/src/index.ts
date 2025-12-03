/**
 * Pager 2077 Backend
 * 
 * Node.js API server with Hono framework and SQLite database
 */

// Load environment variables first
import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { initDatabase } from './db';
import { UserRepository } from './repositories/UserRepository';
import { FriendshipRepository } from './repositories/FriendshipRepository';
import { MessageRepository } from './repositories/MessageRepository';
import { LeaderboardRepository } from './repositories/LeaderboardRepository';
import { UserService } from './services/UserService';
import { FriendshipService } from './services/FriendshipService';
import { MessageService } from './services/MessageService';
import { NotificationService } from './services/NotificationService';
import { LeaderboardService } from './services/LeaderboardService';
import { AppError } from './utils/errors';
import { verifyJWT } from './utils/jwt';
import type { ApiResponse, RegisterUserRequest, SendFriendRequestRequest, GameId } from './models';

console.log('🚀 Pager 2077 Backend Starting...');

// Initialize database
const db = initDatabase();

// Initialize Redis and notification queue
import { initRedis } from './queue/redis';
import { initNotificationQueue, startNotificationWorker } from './queue/notificationQueue';

initRedis();
initNotificationQueue();
startNotificationWorker();

// Initialize repositories
const userRepo = new UserRepository(db);
const friendshipRepo = new FriendshipRepository(db);
const messageRepo = new MessageRepository(db);
const leaderboardRepo = new LeaderboardRepository(db);

// Initialize services
const userService = new UserService(userRepo);
const friendshipService = new FriendshipService(userRepo, friendshipRepo);
const notificationService = new NotificationService();
const messageService = new MessageService(messageRepo, userRepo, friendshipRepo, notificationService);
const leaderboardService = new LeaderboardService(leaderboardRepo, friendshipRepo, userRepo);

// Create Hono app
const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Extract user ID from Authorization header
 */
function getUserIdFromAuth(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const payload = verifyJWT(token);
    return payload.userId;
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }
}

// Error handler middleware
app.onError((err, c) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    return c.json(response, err.statusCode as any);
  }

  // Unknown error
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  return c.json(response, 500);
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Queue metrics
app.get('/api/queue/metrics', async (c) => {
  const { getQueueMetrics } = await import('./queue/notificationQueue');
  const metrics = await getQueueMetrics();
  return c.json({ success: true, data: metrics });
});

// ============================================
// User Routes
// ============================================

app.post('/api/users/register', async (c) => {
  const body = await c.req.json() as RegisterUserRequest;
  const result = userService.registerUser(body.deviceToken);
  return c.json({ success: true, data: result }, 201);
});

app.get('/api/users/me', (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const user = userService.getUserById(userId);
  return c.json({ success: true, data: user });
});

app.put('/api/users/status', async (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const body = await c.req.json() as { status: 'online' | 'offline' };
  
  userService.updateUserStatus(userId, body.status);

  const user = userService.getUserById(userId);
  const friends = friendshipService.getUserFriends(userId);
  await notificationService.broadcastStatusToFriends(friends, user.hexCode, body.status);

  return c.json({ success: true, data: { success: true } });
});

app.put('/api/users/display-name', async (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const body = await c.req.json() as { displayName: string };
  
  if (body.displayName === undefined) {
    throw new AppError(400, 'INVALID_INPUT', 'Display name is required');
  }
  
  const updatedUser = userService.updateDisplayName(userId, body.displayName);

  return c.json({
    success: true,
    data: {
      userId: updatedUser.id,
      hexCode: updatedUser.hexCode,
      displayName: updatedUser.displayName,
    },
  });
});

app.put('/api/users/live-activity-token', async (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const body = await c.req.json() as { liveActivityToken: string | null };
  
  const token = body.liveActivityToken ?? null;
  userService.updateLiveActivityToken(userId, token);

  return c.json({ success: true, data: { success: true } });
});

// ============================================
// Friend Routes
// ============================================

app.post('/api/friends/request', async (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const body = await c.req.json() as SendFriendRequestRequest;
  
  const request = friendshipService.sendFriendRequest(userId, body.toHexCode);

  const sender = userService.getUserById(userId);
  const recipient = userService.getUserByHexCode(body.toHexCode.toUpperCase());
  if (recipient) {
    try {
      // Pass sender's display name for notification (falls back to hex code if null)
      await notificationService.notifyFriendRequest(recipient, sender.hexCode, request.id, sender.displayName);
    } catch (notifError) {
      console.error('Failed to send friend request notification:', notifError);
    }
  }

  return c.json({ success: true, data: request }, 201);
});

app.get('/api/friends/requests/pending', (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const requests = friendshipService.getPendingRequestsWithDisplayNames(userId);
  return c.json({ success: true, data: { requests } });
});

app.post('/api/friends/requests/:id/accept', async (c) => {
  const requestId = c.req.param('id');
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  
  const friend = friendshipService.acceptFriendRequest(requestId, userId);
  const accepter = userService.getUserById(userId);
  
  try {
    await notificationService.notifyFriendRequestAccepted(friend, accepter.hexCode);
  } catch (notifError) {
    console.error('Failed to send friend request accepted notification:', notifError);
  }

  return c.json({ success: true, data: { friend } });
});

app.post('/api/friends/requests/:id/reject', (c) => {
  const requestId = c.req.param('id');
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  
  friendshipService.rejectFriendRequest(requestId, userId);

  return c.json({ success: true, data: { success: true } });
});

app.get('/api/friends', (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const friends = friendshipService.getUserFriends(userId);

  const friendsWithDisplayNames = friends.map(friend => ({
    id: friend.id,
    hexCode: friend.hexCode,
    displayName: friend.displayName,
    status: friend.status,
    lastSeen: friend.lastSeen,
  }));

  return c.json({ success: true, data: { friends: friendsWithDisplayNames } });
});

app.delete('/api/friends/:friendId', (c) => {
  const friendId = c.req.param('friendId');
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  
  friendshipService.removeFriend(userId, friendId);

  return c.json({ success: true, data: { success: true } });
});

// ============================================
// Message Routes
// ============================================

app.post('/api/messages', async (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const body = await c.req.json() as { recipientId: string; text: string };
  
  if (!body.recipientId) {
    throw new AppError(400, 'INVALID_INPUT', 'Recipient ID is required');
  }
  
  if (!body.text) {
    throw new AppError(400, 'INVALID_INPUT', 'Message text is required');
  }
  
  const message = await messageService.createMessage(userId, body.recipientId, body.text);

  return c.json({
    success: true,
    data: {
      messageId: message.id,
      timestamp: message.createdAt.toISOString(),
    },
  }, 201);
});

app.get('/api/messages/:friendId', (c) => {
  const friendId = c.req.param('friendId');
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  
  const limitParam = c.req.query('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 50;
  
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new AppError(400, 'INVALID_INPUT', 'Limit must be between 1 and 100');
  }
  
  const messages = messageService.getMessageHistory(userId, friendId, limit);
  const friend = userService.getUserById(friendId);
  const user = userService.getUserById(userId);
  
  const messagesWithNames = messages.map(msg => ({
    id: msg.id,
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    text: msg.text,
    isRead: msg.isRead,
    timestamp: msg.createdAt.toISOString(),
    senderDisplayName: msg.senderId === userId 
      ? (user?.displayName || user?.hexCode || null)
      : (friend?.displayName || friend?.hexCode || null),
  }));

  return c.json({ success: true, data: { messages: messagesWithNames } });
});

// ============================================
// Conversations Route
// ============================================

app.get('/api/conversations', (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  
  const conversations = messageService.getConversationsWithUnread(userId);
  
  const conversationsResponse = conversations.map(conv => ({
    friendId: conv.friendId,
    friendHexCode: conv.friendHexCode,
    friendDisplayName: conv.friendDisplayName,
    unreadCount: conv.unreadCount,
    lastMessage: conv.lastMessage ? {
      id: conv.lastMessage.id,
      senderId: conv.lastMessage.senderId,
      text: conv.lastMessage.text,
      timestamp: conv.lastMessage.createdAt.toISOString(),
    } : null,
  }));

  return c.json({ success: true, data: { conversations: conversationsResponse } });
});

// ============================================
// Leaderboard Routes
// ============================================

const VALID_GAMES: GameId[] = ['snake', 'tetris'];

function isValidGame(game: string): game is GameId {
  return VALID_GAMES.includes(game as GameId);
}

/**
 * POST /api/scores - Submit a new high score
 * Requirements: 1.1, 1.2, 1.3
 */
app.post('/api/scores', async (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const body = await c.req.json() as { game: string; score: number };
  
  // Validate game parameter
  if (!body.game || !isValidGame(body.game)) {
    throw new AppError(400, 'INVALID_GAME', 'Game must be one of: snake, tetris');
  }
  
  // Validate score parameter
  if (typeof body.score !== 'number' || !Number.isInteger(body.score) || body.score < 0) {
    throw new AppError(400, 'INVALID_SCORE', 'Score must be a non-negative integer');
  }
  
  const result = leaderboardService.submitScore(userId, body.game, body.score);
  
  return c.json({
    success: true,
    data: {
      updated: result.updated,
      score: result.score.score,
      updatedAt: result.score.updatedAt.toISOString(),
    },
  });
});

/**
 * GET /api/leaderboard/:game - Get friends leaderboard for a game
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
app.get('/api/leaderboard/:game', (c) => {
  const userId = getUserIdFromAuth(c.req.header('Authorization'));
  const game = c.req.param('game');
  
  // Validate game parameter
  if (!isValidGame(game)) {
    throw new AppError(400, 'INVALID_GAME', 'Game must be one of: snake, tetris');
  }
  
  const entries = leaderboardService.getFriendsLeaderboard(userId, game);
  
  return c.json({
    success: true,
    data: {
      entries,
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  }, 404);
});

// Start server
const port = 3000;
console.log(`✅ Server running on http://localhost:${port}`);
console.log(`📊 Health check: http://localhost:${port}/health`);

serve({
  fetch: app.fetch,
  port,
});
