import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';
import { T9InputHandler } from '../utils/t9Input';
import { validateAndSanitizeMessage, isEmptyMessage } from '../utils/messageValidation';
import { sendMessage, getMessageHistory } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { mapApiError, getErrorMessage } from '../utils/errorMessages';
import * as Haptics from 'expo-haptics';

interface Friend {
  id: string;
  sixDigitCode: string;
  displayName?: string;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

interface ConversationState {
  lastMessage: Message | null;
  isWaitingForReply: boolean;
  hasUnreadMessage: boolean;
}

interface IndividualChatScreenProps {
  friend: Friend;
  onBack: () => void;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  displayNameMap?: Record<string, string>;
}

export interface IndividualChatScreenHandle {
  handleNumberPress: (key: string) => void;
  handleConfirm: () => void;
  handleCall: () => void;
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

export const IndividualChatScreen = forwardRef<IndividualChatScreenHandle, IndividualChatScreenProps>(({
  friend,
  onBack,
  soundEnabled,
  vibrateEnabled,
  displayNameMap = {},
}, ref) => {
  // Auth context
  const { authToken: token, hexCode } = useAuth();

  // State management
  const [messageText, setMessageText] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>({
    lastMessage: null,
    isWaitingForReply: false,
    hasUnreadMessage: false,
  });
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // T9 input handler
  const t9Handler = useRef(new T9InputHandler());

  // Error clear timeout
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Blinking cursor animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Get friend's display name
  const friendDisplayName = displayNameMap[friend.sixDigitCode] || friend.displayName || friend.sixDigitCode;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleNumberPress,
    handleConfirm,
    handleCall,
  }));

  // Blinking cursor animation
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();

    return () => {
      blink.stop();
    };
  }, [cursorOpacity]);

  // Cleanup T9 handler and error timeout on unmount
  useEffect(() => {
    return () => {
      t9Handler.current.cleanup();
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Polling interval ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch latest message
  const fetchLatestMessage = async (isInitialLoad = false) => {
    if (!token) {
      if (isInitialLoad) setIsLoading(false);
      return;
    }

    if (isInitialLoad) setIsLoading(true);
    
    try {
      // Get only the latest message (limit: 1)
      // Use friend.id (user ID) for API call, not sixDigitCode (hex code)
      const messages = await getMessageHistory(token, friend.id, 1);
      
      if (messages.length > 0) {
        const latestMsg = messages[0];
        const isSent = latestMsg.senderId === hexCode;
        
        // Check if this is a new message (different from current)
        const isNewMessage = !conversationState.lastMessage || 
          latestMsg.id !== conversationState.lastMessage.id;
        
        if (isNewMessage || isInitialLoad) {
          setConversationState({
            lastMessage: {
              ...latestMsg,
              isSent,
            },
            isWaitingForReply: isSent, // If we sent it, we're waiting for reply
            hasUnreadMessage: !isSent, // If they sent it, it's unread
          });
          
          // If we received a reply while waiting, trigger haptic feedback
          if (!isInitialLoad && !isSent && conversationState.isWaitingForReply && vibrateEnabled) {
            triggerSuccessHaptic();
          }
        }
      } else if (isInitialLoad) {
        // No messages - fresh conversation
        setConversationState({
          lastMessage: null,
          isWaitingForReply: false,
          hasUnreadMessage: false,
        });
      }
    } catch (error) {
      console.error('Failed to load latest message:', error);
      if (isInitialLoad) {
        // Silently fail - show as no messages
        setConversationState({
          lastMessage: null,
          isWaitingForReply: false,
          hasUnreadMessage: false,
        });
      }
    } finally {
      if (isInitialLoad) setIsLoading(false);
    }
  };

  // Load latest message on mount
  useEffect(() => {
    fetchLatestMessage(true);
  }, [friend.id, token, hexCode]);

  // Poll for new messages when waiting for reply
  useEffect(() => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Start polling if waiting for reply
    if (conversationState.isWaitingForReply && token) {
      console.log('[IndividualChatScreen] Starting polling for reply...');
      
      // Poll every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        console.log('[IndividualChatScreen] Polling for new messages...');
        fetchLatestMessage(false);
      }, 3000);
    }

    // Cleanup on unmount or when waiting state changes
    return () => {
      if (pollingIntervalRef.current) {
        console.log('[IndividualChatScreen] Stopping polling');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [conversationState.isWaitingForReply, token, friend.id]);

  // Handle number key press for T9 input
  const handleNumberPress = (key: string) => {
    if (key === '#') {
      // Backspace
      const newText = t9Handler.current.handleBackspace();
      setMessageText(newText);
    } else if (key >= '0' && key <= '9') {
      // Check if at max length
      if (messageText.length >= 500) {
        return; // Ignore input at max length
      }
      // Handle T9 input
      const newText = t9Handler.current.handleKeyPress(key);
      setMessageText(newText);
    }
  };

  // Handle confirm button (center circle)
  const handleConfirm = () => {
    // Confirm current character - T9 handler will finalize on timeout
    // This is a no-op for now as T9 handler auto-confirms
  };

  // Handle call button (send message)
  const handleCall = async () => {
    // Ignore if empty or whitespace-only
    if (isEmptyMessage(messageText)) {
      return;
    }

    // Validate and sanitize message
    const sanitizedMessage = validateAndSanitizeMessage(messageText);
    if (!sanitizedMessage) {
      return;
    }

    // Check if we have a token
    if (!token) {
      setErrorMessage('NOT AUTHORIZED');
      setSendStatus('error');
      triggerErrorHaptic();
      startErrorClearTimer();
      return;
    }

    try {
      // Trigger send haptic
      if (vibrateEnabled) {
        triggerSendHaptic();
      }

      // Set sending status
      setSendStatus('sending');
      setErrorMessage(null);

      // Send message - use friend.id (user ID) for API call
      const result = await sendMessage(token, friend.id, sanitizedMessage);

      // Success - trigger success haptic
      if (vibrateEnabled) {
        triggerSuccessHaptic();
      }

      // Clear composer and show confirmation
      t9Handler.current.clear();
      setMessageText('');
      setSendStatus('sent');

      // Update conversation state - now waiting for reply
      const newMessage: Message = {
        id: result.messageId,
        senderId: hexCode || 'current-user',
        recipientId: friend.sixDigitCode,
        text: sanitizedMessage,
        timestamp: result.timestamp,
        isSent: true,
      };
      
      setConversationState({
        lastMessage: newMessage,
        isWaitingForReply: true,
        hasUnreadMessage: false,
      });

      // Clear sent status after 2 seconds
      setTimeout(() => {
        setSendStatus('idle');
      }, 2000);
    } catch (error) {
      // Handle errors
      setSendStatus('error');
      
      // Trigger error haptic
      if (vibrateEnabled) {
        triggerErrorHaptic();
      }
      
      // Map error to user-friendly message
      const errorCode = mapApiError(error);
      const friendlyMessage = getErrorMessage(errorCode);
      setErrorMessage(friendlyMessage);

      // Start error clear timer
      startErrorClearTimer();
    }
  };

  // Haptic feedback functions
  const triggerSendHaptic = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  const triggerSuccessHaptic = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  const triggerErrorHaptic = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  // Start timer to clear error message after 3 seconds
  const startErrorClearTimer = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(null);
      setSendStatus('idle');
    }, 3000);
  };

  // Handle menu button
  const handleMenu = () => {
    onBack();
  };

  return (
    <PagerScreen title={friendDisplayName}>
      {/* Loading State */}
      {isLoading ? (
        <PagerText>LOADING...</PagerText>
      ) : (
        <>
          {/* Latest Message Display */}
          {conversationState.lastMessage ? (
            <View style={styles.messageContainer}>
              <PagerText>
                {conversationState.lastMessage.isSent ? 'YOU SENT:' : `FROM ${friendDisplayName}:`}
              </PagerText>
              <View style={styles.spacer} />
              <PagerText>
                "{conversationState.lastMessage.text}"
              </PagerText>
              <View style={styles.spacer} />
              <PagerText style={styles.timestamp}>
                {formatTimestamp(conversationState.lastMessage.timestamp)}
              </PagerText>
            </View>
          ) : (
            <PagerText>NO MESSAGES</PagerText>
          )}

          <View style={styles.divider} />

          {/* Waiting for Reply State */}
          {conversationState.isWaitingForReply ? (
            <View style={styles.waitingContainer}>
              <PagerText>WAITING FOR REPLY</PagerText>
            </View>
          ) : (
            <>
              {/* Message Composer */}
              <View style={styles.composerContainer}>
                <PagerText>
                  {conversationState.hasUnreadMessage ? 'REPLY:' : 'MESSAGE:'}
                </PagerText>
                <View style={styles.spacer} />
                
                {/* Message text with blinking underscore cursor at end */}
                <View style={styles.messageInputContainer}>
                  <Text style={styles.messageText}>
                    {messageText}
                  </Text>
                  <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                    _
                  </Animated.Text>
                </View>
                
                <PagerText style={styles.charCount}>
                  {messageText.length}/500
                </PagerText>
                
                {/* Status Indicator */}
                {sendStatus === 'sending' && (
                  <PagerText>SENDING...</PagerText>
                )}
                {sendStatus === 'sent' && (
                  <PagerText>SENT</PagerText>
                )}
                {sendStatus === 'error' && errorMessage && (
                  <PagerText>{errorMessage}</PagerText>
                )}
              </View>
            </>
          )}
        </>
      )}
    </PagerScreen>
  );
});

/**
 * Format timestamp to HH:MM format
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
}

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 16,
  },
  spacer: {
    height: 8,
  },
  divider: {
    height: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#3d3d3dff',
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
  },
  waitingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  composerContainer: {
    marginTop: 8,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cursor: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
    marginLeft: 0,
  },
  messageText: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1.5,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  charCount: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
  },
});
