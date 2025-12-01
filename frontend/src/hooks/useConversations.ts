/**
 * useConversations Hook - Fetch and manage conversations with unread messages from backend
 * Requirements: 10.1, 10.2
 */
import { useState, useEffect, useCallback } from 'react';
import { getConversations } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import type { Conversation } from '../types';

// Interface matching what MessagesScreen expects
export interface MessageListItem {
  from: string;
  text: string;
  time: string;
  friendId?: string;
  displayName?: string;
}

interface UseConversationsResult {
  conversations: MessageListItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Format timestamp to display time (HH:MM format)
 */
function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Hook to fetch and manage conversations with unread messages
 * Requirements:
 * - 10.1: Fetch conversations with unread messages from backend
 * - 10.2: Display each sender's hex code or display name
 */
export function useConversations(): UseConversationsResult {
  const { authToken, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<MessageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform API Conversation to MessageListItem format
   * Maps conversation data to the format expected by MessagesScreen
   */
  const transformConversation = (conversation: Conversation): MessageListItem => ({
    from: conversation.friendHexCode,
    text: conversation.lastMessage?.text || '',
    time: conversation.lastMessage?.timestamp 
      ? formatTime(conversation.lastMessage.timestamp) 
      : '',
    friendId: conversation.friendId,
    displayName: conversation.friendDisplayName || undefined,
  });

  /**
   * Fetch conversations from backend
   * Requirements: 10.1
   */
  const fetchConversations = useCallback(async () => {
    // Skip if not authenticated or no token
    if (!isAuthenticated || !authToken) {
      console.log('[useConversations] Skipping fetch - not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useConversations] Fetching conversations from backend...');
      const conversationsList = await getConversations(authToken);
      
      // Transform to UI format and filter to only show conversations with unread messages
      // Requirement 10.1: Show conversations with unread messages
      const transformedConversations = conversationsList
        .filter(conv => conv.unreadCount > 0)
        .map(transformConversation);
      
      setConversations(transformedConversations);
      
      console.log(`[useConversations] Loaded ${transformedConversations.length} conversations with unread messages`);
    } catch (err) {
      console.error('[useConversations] Error fetching conversations:', err);
      
      // Set user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated]);

  /**
   * Refresh function for manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  // Fetch conversations on mount and when auth changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refresh,
  };
}
