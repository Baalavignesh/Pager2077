/**
 * useFriends Hook - Fetch and manage friends list from backend
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
import { useState, useEffect, useCallback } from 'react';
import { getFriends } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import type { Friend } from '../types';

// Interface matching what FriendsListScreen expects
export interface FriendListItem {
  sixDigitCode: string;
  status: 'ONLINE' | 'OFFLINE';
  displayName?: string;
  id?: string;
}

interface UseFriendsResult {
  friends: FriendListItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage friends list
 * Requirements:
 * - 3.1: Fetch friends list from backend API
 * - 3.2: Display each friend's hex code or display name
 * - 3.3: Display each friend's online/offline status
 * - 3.4: Display "NO FRIENDS YET" when list is empty
 * - 3.5: Display error message and allow retry on failure
 */
export function useFriends(): UseFriendsResult {
  const { authToken, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform API Friend to FriendListItem format
   * Maps hexCode to sixDigitCode for UI compatibility
   */
  const transformFriend = (friend: Friend): FriendListItem => ({
    sixDigitCode: friend.hexCode,
    status: friend.status === 'online' ? 'ONLINE' : 'OFFLINE',
    displayName: friend.displayName || undefined,
    id: friend.id,
  });

  /**
   * Fetch friends from backend
   * Requirements: 3.1, 3.5
   */
  const fetchFriends = useCallback(async () => {
    // Skip if not authenticated or no token
    if (!isAuthenticated || !authToken) {
      console.log('[useFriends] Skipping fetch - not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useFriends] Fetching friends from backend...');
      const friendsList = await getFriends(authToken);
      
      // Transform to UI format
      const transformedFriends = friendsList.map(transformFriend);
      setFriends(transformedFriends);
      
      console.log(`[useFriends] Loaded ${transformedFriends.length} friends`);
    } catch (err) {
      console.error('[useFriends] Error fetching friends:', err);
      
      // Set user-friendly error message (Requirement 3.5)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load friends';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated]);

  /**
   * Refresh function for manual refresh (Requirement 3.5 - allow retry)
   */
  const refresh = useCallback(async () => {
    await fetchFriends();
  }, [fetchFriends]);

  // Fetch friends on mount and when auth changes
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    isLoading,
    error,
    refresh,
  };
}
