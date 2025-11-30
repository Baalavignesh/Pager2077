/**
 * Pager 2077 Backend
 * 
 * Bun API server with SQLite database using proper Bun routing
 */

import { initDatabase } from './db';
import { UserRepository } from './repositories/UserRepository';
import { FriendshipRepository } from './repositories/FriendshipRepository';
import { MessageRepository } from './repositories/MessageRepository';
import { UserService } from './services/UserService';
import { FriendshipService } from './services/FriendshipService';
import { MessageService } from './services/MessageService';
import { NotificationService } from './services/NotificationService';
import { AppError } from './utils/errors';
import { verifyJWT } from './utils/jwt';
import type { ApiResponse, RegisterUserRequest, SendFriendRequestRequest } from './models';

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

// Initialize services
const userService = new UserService(userRepo);
const friendshipService = new FriendshipService(userRepo, friendshipRepo);
const notificationService = new NotificationService();
const messageService = new MessageService(messageRepo, userRepo, friendshipRepo, notificationService);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Extract user ID from Authorization header
 */
function getUserIdFromAuth(req: Request): string {
  const authHeader = req.headers.get('Authorization');
  
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

/**
 * Handle errors and return appropriate response
 */
function handleError(error: unknown): Response {
  console.error('Error:', error);

  if (error instanceof AppError) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };

    return Response.json(response, {
      status: error.statusCode,
      headers: corsHeaders,
    });
  }

  // Unknown error
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  return Response.json(response, {
    status: 500,
    headers: corsHeaders,
  });
}

/**
 * Main server with Bun routing
 */
const server = Bun.serve({
  port: 3000,
  routes: {
    // Health check
    "/health": () => Response.json({ status: 'ok' }, { headers: corsHeaders }),
    
    // Queue metrics
    "/api/queue/metrics": async () => {
      try {
        const { getQueueMetrics } = await import('./queue/notificationQueue');
        const metrics = await getQueueMetrics();
        return Response.json({ success: true, data: metrics }, { headers: corsHeaders });
      } catch (error) {
        return handleError(error);
      }
    },
    
    // User routes
    "/api/users/register": {
      POST: async (req) => {
        try {
          const body = await req.json() as RegisterUserRequest;
          const result = userService.registerUser(body.deviceToken);
          return Response.json({ success: true, data: result }, { status: 201, headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    "/api/users/me": {
      GET: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const user = userService.getUserById(userId);
          return Response.json({ success: true, data: user }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    "/api/users/status": {
      PUT: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const body = await req.json() as { status: 'online' | 'offline' };
          
          userService.updateUserStatus(userId, body.status);

          const user = userService.getUserById(userId);
          const friends = friendshipService.getUserFriends(userId);
          await notificationService.broadcastStatusToFriends(friends, user.hexCode, body.status);

          return Response.json({ success: true, data: { success: true } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    "/api/users/display-name": {
      PUT: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const body = await req.json() as { displayName: string };
          
          if (body.displayName === undefined) {
            throw new AppError(400, 'INVALID_INPUT', 'Display name is required');
          }
          
          const updatedUser = userService.updateDisplayName(userId, body.displayName);

          return Response.json({
            success: true,
            data: {
              userId: updatedUser.id,
              hexCode: updatedUser.hexCode,
              displayName: updatedUser.displayName,
            },
          }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    "/api/users/live-activity-token": {
      PUT: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const body = await req.json() as { liveActivityToken: string | null };
          
          const token = body.liveActivityToken ?? null;
          userService.updateLiveActivityToken(userId, token);

          return Response.json({ success: true, data: { success: true } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Friend routes
    "/api/friends/request": {
      POST: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const body = await req.json() as SendFriendRequestRequest;
          
          const request = friendshipService.sendFriendRequest(userId, body.toHexCode);

          const sender = userService.getUserById(userId);
          const recipient = userService.getUserByHexCode(body.toHexCode.toUpperCase());
          if (recipient) {
            // Notification is best-effort, don't fail the request if it fails
            try {
              await notificationService.notifyFriendRequest(recipient, sender.hexCode, request.id);
            } catch (notifError) {
              console.error('Failed to send friend request notification:', notifError);
            }
          }

          return Response.json({ success: true, data: request }, { status: 201, headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // GET /api/friends/requests/pending
    // Requirements: 13.2 - Include requester's display name
    "/api/friends/requests/pending": {
      GET: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const requests = friendshipService.getPendingRequestsWithDisplayNames(userId);

          return Response.json({ success: true, data: { requests } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Dynamic route: POST /api/friends/requests/:id/accept
    "/api/friends/requests/:id/accept": {
      POST: async (req) => {
        try {
          const requestId = req.params.id;
          const userId = getUserIdFromAuth(req);
          
          const friend = friendshipService.acceptFriendRequest(requestId, userId);
          const accepter = userService.getUserById(userId);
          
          // Notification is best-effort, don't fail the request if it fails
          try {
            await notificationService.notifyFriendRequestAccepted(friend, accepter.hexCode);
          } catch (notifError) {
            console.error('Failed to send friend request accepted notification:', notifError);
          }

          return Response.json({ success: true, data: { friend } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Dynamic route: POST /api/friends/requests/:id/reject
    "/api/friends/requests/:id/reject": {
      POST: async (req) => {
        try {
          const requestId = req.params.id;
          const userId = getUserIdFromAuth(req);
          
          friendshipService.rejectFriendRequest(requestId, userId);

          return Response.json({ success: true, data: { success: true } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // GET /api/friends
    // Requirements: 13.1 - Include display names for each friend
    "/api/friends": {
      GET: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const friends = friendshipService.getUserFriends(userId);

          // Map to include displayName explicitly in response
          const friendsWithDisplayNames = friends.map(friend => ({
            id: friend.id,
            hexCode: friend.hexCode,
            displayName: friend.displayName,
            status: friend.status,
            lastSeen: friend.lastSeen,
          }));

          return Response.json({ success: true, data: { friends: friendsWithDisplayNames } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Dynamic route: DELETE /api/friends/:friendId
    "/api/friends/:friendId": {
      DELETE: async (req) => {
        try {
          const friendId = req.params.friendId;
          const userId = getUserIdFromAuth(req);
          
          friendshipService.removeFriend(userId, friendId);

          return Response.json({ success: true, data: { success: true } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Message routes
    "/api/messages": {
      POST: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          const body = await req.json() as { recipientId: string; text: string };
          
          if (!body.recipientId) {
            throw new AppError(400, 'INVALID_INPUT', 'Recipient ID is required');
          }
          
          if (!body.text) {
            throw new AppError(400, 'INVALID_INPUT', 'Message text is required');
          }
          
          const message = await messageService.createMessage(userId, body.recipientId, body.text);

          return Response.json({
            success: true,
            data: {
              messageId: message.id,
              timestamp: message.createdAt.toISOString(),
            },
          }, { status: 201, headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Dynamic route: GET /api/messages/:friendId
    "/api/messages/:friendId": {
      GET: async (req) => {
        try {
          const friendId = req.params.friendId;
          const userId = getUserIdFromAuth(req);
          const url = new URL(req.url);
          
          const limitParam = url.searchParams.get('limit');
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

          return Response.json({ success: true, data: { messages: messagesWithNames } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
    
    // Conversations route
    "/api/conversations": {
      GET: async (req) => {
        try {
          const userId = getUserIdFromAuth(req);
          
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

          return Response.json({ success: true, data: { conversations: conversationsResponse } }, { headers: corsHeaders });
        } catch (error) {
          return handleError(error);
        }
      },
    },
  },
  
  // Handle OPTIONS preflight and unmatched routes
  fetch(req) {
    const method = req.method;

    // Handle OPTIONS preflight for all routes
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 404 Not Found
    return Response.json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    }, { status: 404, headers: corsHeaders });
  },
});

console.log(`✅ Server running on http://localhost:${server.port}`);
console.log(`📊 Health check: http://localhost:${server.port}/health`);
