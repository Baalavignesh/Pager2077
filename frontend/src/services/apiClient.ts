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
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deviceToken }),
  });

  const data: ApiResponse<RegistrationResponse> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Registration failed');
  }

  return data.data;
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
