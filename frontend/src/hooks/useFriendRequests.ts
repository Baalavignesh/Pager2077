/**
 * useFriendRequests Hook - Fetch and manage friend requests from backend
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
import { useState, useEffect, useCallback } from 'react';
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import type { FriendRequest } from '../types';

// Interface matching what FriendRequestsScreen expects
export interface FriendRequestListItem {
  id: string;
  sixDigitCode: string;
  timestamp: string;
  displayName?: string;
}

interface UseFriendRequestsResult {
  requests: FriendRequestListItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
}

/**
 * Hook to fetch and manage friend requests
 * Requirements:
 * - 5.1: Fetch pending requests from backend
 * - 5.2: Display each requester's hex code or display name
 * - 5.3: Send accept request to backend
 * - 5.4: Send reject request to backend
 */
export function useFriendRequests(): UseFriendRequestsResult {
  const { authToken, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<FriendRequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform API FriendRequest to FriendRequestListItem format
   * Maps fromUserHexCode to sixDigitCode for UI compatibility
   */
  const transformRequest = (request: FriendRequest): FriendRequestListItem => ({
    id: request.id,
    sixDigitCode: request.fromUserHexCode,
    timestamp: request.createdAt,
    displayName: request.fromUserDisplayName || undefined,
  });

  /**
   * Fetch pending friend requests from backend
   * Requirements: 5.1
   */
  const fetchRequests = useCallback(async () => {
    // Skip if not authenticated or no token
    if (!isAuthenticated || !authToken) {
      console.log('[useFriendRequests] Skipping fetch - not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useFriendRequests] Fetching pending requests from backend...');
      const requestsList = await getPendingRequests(authToken);
      
      // Transform to UI format
      const transformedRequests = requestsList.map(transformRequest);
      setRequests(transformedRequests);
      
      console.log(`[useFriendRequests] Loaded ${transformedRequests.length} pending requests`);
    } catch (err) {
      console.error('[useFriendRequests] Error fetching requests:', err);
      
      // Set user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated]);

  /**
   * Refresh function for manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchRequests();
  }, [fetchRequests]);

  /**
   * Accept a friend request
   * Requirements: 5.3, 5.5, 5.6
   * Returns true on success, false on failure
   */
  const acceptRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!authToken) {
      console.error('[useFriendRequests] Cannot accept - not authenticated');
      return false;
    }

    try {
      console.log('[useFriendRequests] Accepting request:', requestId);
      await acceptFriendRequest(authToken, requestId);
      
      // Remove from local state (Requirement 5.6)
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      console.log('[useFriendRequests] Request accepted successfully');
      return true;
    } catch (err) {
      console.error('[useFriendRequests] Error accepting request:', err);
      return false;
    }
  }, [authToken]);

  /**
   * Reject a friend request
   * Requirements: 5.4, 5.6
   * Returns true on success, false on failure
   */
  const rejectRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!authToken) {
      console.error('[useFriendRequests] Cannot reject - not authenticated');
      return false;
    }

    try {
      console.log('[useFriendRequests] Rejecting request:', requestId);
      await rejectFriendRequest(authToken, requestId);
      
      // Remove from local state (Requirement 5.6)
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      console.log('[useFriendRequests] Request rejected successfully');
      return true;
    } catch (err) {
      console.error('[useFriendRequests] Error rejecting request:', err);
      return false;
    }
  }, [authToken]);

  // Fetch requests on mount and when auth changes
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    refresh,
    acceptRequest,
    rejectRequest,
  };
}
