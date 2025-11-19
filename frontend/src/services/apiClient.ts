/**
 * API Client - Backend communication
 */
import type { ApiResponse, RegistrationResponse, User } from '../types';

const API_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://api.pager2077.app'; // Update with production URL

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
