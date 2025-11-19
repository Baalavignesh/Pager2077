/**
 * Pager 2077 Backend
 * 
 * Bun API server with SQLite database
 */

import { initDatabase, getDatabase } from './db';
import { UserRepository } from './repositories/UserRepository';
import { FriendshipRepository } from './repositories/FriendshipRepository';
import { UserService } from './services/UserService';
import { FriendshipService } from './services/FriendshipService';
import { AppError } from './utils/errors';
import { verifyJWT } from './utils/jwt';
import type { ApiResponse, RegisterUserRequest, SendFriendRequestRequest } from './models';

console.log('🚀 Pager 2077 Backend Starting...');

// Initialize database
const db = initDatabase();

// Initialize Redis and notification queue
import { initRedis } from './queue/redis';
import { initNotificationQueue, startNotificationWorker } from './queue/notificationQueue';
import { NotificationService } from './services/NotificationService';

initRedis();
initNotificationQueue();
startNotificationWorker();

// Initialize repositories
const userRepo = new UserRepository(db);
const friendshipRepo = new FriendshipRepository(db);

// Initialize services
const userService = new UserService(userRepo);
const friendshipService = new FriendshipService(userRepo, friendshipRepo);
const notificationService = new NotificationService();

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
  } catch (error) {
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

    return new Response(JSON.stringify(response), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
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

  return new Response(JSON.stringify(response), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Main server
 */
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/health' && method === 'GET') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Queue metrics
      if (path === '/api/queue/metrics' && method === 'GET') {
        const { getQueueMetrics } = await import('./queue/notificationQueue');
        const metrics = await getQueueMetrics();

        const response: ApiResponse<typeof metrics> = {
          success: true,
          data: metrics,
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/users/register
      if (path === '/api/users/register' && method === 'POST') {
        const body = await req.json() as RegisterUserRequest;
        const result = userService.registerUser(body.deviceToken);

        const response: ApiResponse<typeof result> = {
          success: true,
          data: result,
        };

        return new Response(JSON.stringify(response), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // GET /api/users/me
      if (path === '/api/users/me' && method === 'GET') {
        const userId = getUserIdFromAuth(req);
        const user = userService.getUserById(userId);

        const response: ApiResponse<typeof user> = {
          success: true,
          data: user,
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // PUT /api/users/status
      if (path === '/api/users/status' && method === 'PUT') {
        const userId = getUserIdFromAuth(req);
        const body = await req.json() as { status: 'online' | 'offline' };
        
        userService.updateUserStatus(userId, body.status);

        // Broadcast status change to all friends (silent notifications)
        const user = userService.getUserById(userId);
        const friends = friendshipService.getUserFriends(userId);
        await notificationService.broadcastStatusToFriends(friends, user.hexCode, body.status);

        const response: ApiResponse<{ success: boolean }> = {
          success: true,
          data: { success: true },
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/friends/request
      if (path === '/api/friends/request' && method === 'POST') {
        const userId = getUserIdFromAuth(req);
        const body = await req.json() as SendFriendRequestRequest;
        
        const request = friendshipService.sendFriendRequest(userId, body.toHexCode);

        // Send notification to recipient
        const sender = userService.getUserById(userId);
        const recipient = userService.getUserByHexCode(body.toHexCode.toUpperCase());
        if (recipient) {
          await notificationService.notifyFriendRequest(recipient, sender.hexCode, request.id);
        }

        const response: ApiResponse<typeof request> = {
          success: true,
          data: request,
        };

        return new Response(JSON.stringify(response), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // GET /api/friends/requests/pending
      if (path === '/api/friends/requests/pending' && method === 'GET') {
        const userId = getUserIdFromAuth(req);
        const requests = friendshipService.getPendingRequests(userId);

        const response: ApiResponse<{ requests: typeof requests }> = {
          success: true,
          data: { requests },
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/friends/requests/:id/accept
      if (path.match(/^\/api\/friends\/requests\/[^/]+\/accept$/) && method === 'POST') {
        const userId = getUserIdFromAuth(req);
        const requestId = path.split('/')[4];
        
        const friend = friendshipService.acceptFriendRequest(requestId, userId);

        // Notify the requester that their request was accepted
        const accepter = userService.getUserById(userId);
        await notificationService.notifyFriendRequestAccepted(friend, accepter.hexCode);

        const response: ApiResponse<{ friend: typeof friend }> = {
          success: true,
          data: { friend },
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/friends/requests/:id/reject
      if (path.match(/^\/api\/friends\/requests\/[^/]+\/reject$/) && method === 'POST') {
        const userId = getUserIdFromAuth(req);
        const requestId = path.split('/')[4];
        
        friendshipService.rejectFriendRequest(requestId, userId);

        const response: ApiResponse<{ success: boolean }> = {
          success: true,
          data: { success: true },
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // GET /api/friends
      if (path === '/api/friends' && method === 'GET') {
        const userId = getUserIdFromAuth(req);
        const friends = friendshipService.getUserFriends(userId);

        const response: ApiResponse<{ friends: typeof friends }> = {
          success: true,
          data: { friends },
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // DELETE /api/friends/:friendId
      if (path.match(/^\/api\/friends\/[^/]+$/) && method === 'DELETE') {
        const userId = getUserIdFromAuth(req);
        const friendId = path.split('/')[3];
        
        friendshipService.removeFriend(userId, friendId);

        const response: ApiResponse<{ success: boolean }> = {
          success: true,
          data: { success: true },
        };

        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 404 Not Found
      throw new AppError(404, 'NOT_FOUND', 'Endpoint not found');

    } catch (error) {
      const errorResponse = handleError(error);
      // Add CORS headers to error responses
      const headers = new Headers(errorResponse.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(errorResponse.body, {
        status: errorResponse.status,
        headers,
      });
    }
  },
});

console.log(`✅ Server running on http://localhost:${server.port}`);
console.log(`📊 Health check: http://localhost:${server.port}/health`);
