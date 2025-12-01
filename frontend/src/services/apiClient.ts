/**
 * API Client - Backend communication
 */
import type { ApiResponse, RegistrationResponse, User, Friend, FriendRequest, Conversation } from '../types';

// For physical device testing, use your computer's local network IP
// Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
const API_URL = __DEV__ 
  ? 'http://192.168.0.122:3000'  // Local network IP for physical device testing
  : 'https://pager.baalavignesh.com'; // Update with production URL

// Log the API URL on startup
console.log('🌐 API Client initialized with URL:', API_URL);

/**
 * Register user with device token
 */
export async function registerUser(deviceToken: string): Promise<RegistrationResponse> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 BACKEND REGISTRATION REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('API URL:', API_URL);
  console.log('Endpoint:', `${API_URL}/api/users/register`);
  console.log('Device token:', deviceToken);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    console.log('🌐 Sending HTTP POST request...');
    
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceToken }),
    });

    console.log('✅ Got response from server');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    const data: ApiResponse<RegistrationResponse> = await response.json();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 SERVER RESPONSE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!data.success || !data.data) {
      console.error('❌ Registration failed:', data.error);
      throw new Error(data.error?.message || 'Registration failed');
    }

    console.log('🎉 REGISTRATION SUCCESSFUL!');
    console.log('   User ID:', data.data.userId);
    console.log('   Hex Code:', data.data.hexCode);
    console.log('   Token:', data.data.token.substring(0, 20) + '...');

    return data.data;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ REGISTRATION ERROR');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('🚨 NETWORK ERROR: Cannot reach backend server');
      console.error('   Make sure backend is running: cd backend && bun run dev');
      console.error('   Backend should be at:', API_URL);
    }
    
    throw error;
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<User> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to get user');
  }

  return data.data;
}

/**
 * Update user status
 */
export async function updateUserStatus(
  token: string,
  status: 'online' | 'offline'
): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data: ApiResponse<{ success: boolean }> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to update status');
  }
}

/**
 * Send a text message to a friend
 */
export async function sendMessage(
  token: string,
  recipientId: string,
  text: string
): Promise<{ messageId: string; timestamp: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipientId, text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: ApiResponse<{ messageId: string; timestamp: string }> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Failed to send message');
    }

    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    
    // Handle network error
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error('NETWORK_ERROR');
    }
    
    throw error;
  }
}

/**
 * Get message history with a friend
 */
export async function getMessageHistory(
  token: string,
  friendId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  senderDisplayName: string | null;
}>> {
  const response = await fetch(`${API_URL}/api/messages/${friendId}?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<{ messages: Array<any> }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to get message history');
  }

  return data.data.messages;
}

// ============================================
// Friends API Methods
// Requirements: 3.1, 4.1, 5.1, 5.3, 5.4
// ============================================

/**
 * Get friends list
 * Requirements: 3.1 - Fetch friends list from backend API
 */
export async function getFriends(token: string): Promise<Friend[]> {
  const response = await fetch(`${API_URL}/api/friends`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<{ friends: Friend[] }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to get friends list');
  }

  return data.data.friends;
}

/**
 * Send friend request
 * Requirements: 4.1 - Send friend request to backend
 */
export async function sendFriendRequest(
  token: string,
  hexCode: string
): Promise<FriendRequest> {
  const response = await fetch(`${API_URL}/api/friends/request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ toHexCode: hexCode }),
  });

  const data: ApiResponse<FriendRequest> = await response.json();

  if (!data.success || !data.data) {
    // Map backend error codes to user-friendly messages
    const errorCode = data.error?.code;
    if (errorCode === 'USER_NOT_FOUND') {
      throw new Error('USER_NOT_FOUND');
    }
    if (errorCode === 'DUPLICATE_REQUEST') {
      throw new Error('REQUEST_ALREADY_SENT');
    }
    if (errorCode === 'FRIENDSHIP_EXISTS') {
      throw new Error('ALREADY_FRIENDS');
    }
    throw new Error(data.error?.message || 'Failed to send friend request');
  }

  return data.data;
}

/**
 * Get pending friend requests
 * Requirements: 5.1 - Fetch pending requests from backend
 */
export async function getPendingRequests(token: string): Promise<FriendRequest[]> {
  const response = await fetch(`${API_URL}/api/friends/requests/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<{ requests: FriendRequest[] }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to get pending requests');
  }

  return data.data.requests;
}

/**
 * Accept friend request
 * Requirements: 5.3 - Send accept request to backend
 */
export async function acceptFriendRequest(
  token: string,
  requestId: string
): Promise<Friend> {
  const response = await fetch(`${API_URL}/api/friends/requests/${requestId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<{ friend: Friend }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to accept friend request');
  }

  return data.data.friend;
}

/**
 * Reject friend request
 * Requirements: 5.4 - Send reject request to backend
 */
export async function rejectFriendRequest(
  token: string,
  requestId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<{ success: boolean }> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to reject friend request');
  }
}

// ============================================
// Conversations API Methods
// Requirements: 10.1
// ============================================

/**
 * Get conversations with unread messages
 * Requirements: 10.1 - Fetch conversations with unread messages from backend
 */
export async function getConversations(token: string): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ApiResponse<{ conversations: Conversation[] }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to get conversations');
  }

  return data.data.conversations;
}

// ============================================
// User Management API Methods
// Requirements: 11.1, 12.1, 9.3
// ============================================

/**
 * Update user display name
 * Requirements: 11.1, 12.1 - Send display name to backend
 */
export async function updateDisplayName(
  token: string,
  displayName: string
): Promise<{ userId: string; hexCode: string; displayName: string | null }> {
  const response = await fetch(`${API_URL}/api/users/display-name`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ displayName }),
  });

  const data: ApiResponse<{ userId: string; hexCode: string; displayName: string | null }> = await response.json();

  if (!data.success || !data.data) {
    // Map backend error codes to user-friendly messages
    const errorCode = data.error?.code;
    if (errorCode === 'INVALID_DISPLAY_NAME') {
      throw new Error('INVALID_NAME');
    }
    throw new Error(data.error?.message || 'Failed to update display name');
  }

  return data.data;
}

/**
 * Update Live Activity token
 * Requirements: 9.3 - Send Live Activity push token to backend for storage
 * 
 * IMPORTANT: This sends the PUSH-TO-START TOKEN, not the device token!
 * - Push-to-Start Token: Used to remotely start Live Activities (iOS 17.2+)
 * - Device Token: Used for regular push notifications (stored separately)
 */
export async function updateLiveActivityToken(
  token: string,
  liveActivityToken: string | null
): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[LA TOKEN FLOW] Step 4: Sending push-to-start token to backend API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[LA TOKEN FLOW] API URL:', API_URL);
  console.log('[LA TOKEN FLOW] Endpoint: PUT /api/users/live-activity-token');
  console.log('[LA TOKEN FLOW] Token type: Push-to-Start Token (NOT device token)');
  if (liveActivityToken) {
    console.log('[LA TOKEN FLOW] Token preview:', liveActivityToken.substring(0, 32) + '...');
    console.log('[LA TOKEN FLOW] Token length:', liveActivityToken.length, 'characters');
  } else {
    console.log('[LA TOKEN FLOW] Token: null (clearing token)');
  }
  
  const response = await fetch(`${API_URL}/api/users/live-activity-token`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ liveActivityToken }),
  });

  console.log('[LA TOKEN FLOW] Response status:', response.status);
  
  const data: ApiResponse<{ success: boolean }> = await response.json();
  
  console.log('[LA TOKEN FLOW] Response:', JSON.stringify(data));

  if (!data.success) {
    console.log('[LA TOKEN FLOW] ❌ Backend rejected token update');
    throw new Error(data.error?.message || 'Failed to update Live Activity token');
  }
  
  console.log('[LA TOKEN FLOW] ✅ Backend confirmed: Token stored in live_activity_token field');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
