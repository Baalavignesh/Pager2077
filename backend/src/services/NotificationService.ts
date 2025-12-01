/**
 * Notification Service - High-level notification API
 * Uses Redis queue for reliable delivery
 * Requirements: 9.7, 16.3 - Handle Live Activity token invalidation and fallback
 */
import { queueNotification } from '../queue/notificationQueue';
import type { User } from '../models';

// Callback type for clearing invalid LA tokens
type ClearLATokenCallback = (userId: string) => void;

export class NotificationService {
  private clearLATokenCallback: ClearLATokenCallback | null = null;

  /**
   * Set callback for clearing invalid Live Activity tokens
   * Requirements: 9.7, 16.3 - Remove invalid tokens from storage
   */
  setClearLATokenCallback(callback: ClearLATokenCallback): void {
    this.clearLATokenCallback = callback;
  }

  /**
   * Clear Live Activity token for a user
   * Requirements: 16.3 - Remove invalid token from storage
   */
  private clearLiveActivityToken(userId: string): void {
    if (this.clearLATokenCallback) {
      console.log(`🗑️ Clearing invalid Live Activity token for user ${userId}`);
      this.clearLATokenCallback(userId);
    }
  }

  /**
   * Validate Live Activity token format
   * Basic validation to check if token looks valid
   */
  private isValidLAToken(token: string | null | undefined): boolean {
    if (!token) {
      return false;
    }
    // LA tokens should be non-empty strings with reasonable length
    // They are typically base64-encoded and at least 32 characters
    return typeof token === 'string' && token.length >= 32;
  }
  /**
   * Send voice note received notification (alert with sound)
   */
  async notifyVoiceNoteReceived(
    recipient: User,
    senderHexCode: string,
    voiceNoteId: string
  ): Promise<void> {
    await queueNotification({
      type: 'alert',
      userId: recipient.id,
      notification: {
        deviceToken: recipient.deviceToken,
        alert: {
          title: '📟 New Voice Note',
          body: `From ${senderHexCode}`,
          sound: 'default',
        },
        badge: 1,
        data: {
          type: 'VOICE_NOTE',
          voiceNoteId,
          senderId: senderHexCode,
        },
      },
    });
  }

  /**
   * Send friend request notification (alert)
   */
  async notifyFriendRequest(
    recipient: User,
    senderHexCode: string,
    requestId: string
  ): Promise<void> {
    await queueNotification({
      type: 'alert',
      userId: recipient.id,
      notification: {
        deviceToken: recipient.deviceToken,
        alert: {
          title: '👋 Friend Request',
          body: `${senderHexCode} wants to be friends`,
          sound: 'default',
        },
        data: {
          type: 'FRIEND_REQUEST',
          requestId,
          senderHexCode,
        },
      },
    });
  }

  /**
   * Send friend request accepted notification (alert)
   */
  async notifyFriendRequestAccepted(
    recipient: User,
    accepterHexCode: string
  ): Promise<void> {
    await queueNotification({
      type: 'alert',
      userId: recipient.id,
      notification: {
        deviceToken: recipient.deviceToken,
        alert: {
          title: '✅ Friend Request Accepted',
          body: `${accepterHexCode} accepted your request`,
          sound: 'default',
        },
        data: {
          type: 'FRIEND_ACCEPTED',
          friendHexCode: accepterHexCode,
        },
      },
    });
  }

  /**
   * Send friend status update (silent notification for background update)
   */
  async notifyFriendStatusChanged(
    recipient: User,
    friendHexCode: string,
    status: 'online' | 'offline'
  ): Promise<void> {
    await queueNotification({
      type: 'silent',
      userId: recipient.id,
      notification: {
        deviceToken: recipient.deviceToken,
        contentAvailable: true,
        data: {
          type: 'FRIEND_STATUS',
          friendHexCode,
          status,
        },
      },
    });
  }

  /**
   * Broadcast status change to all friends (silent notifications)
   */
  async broadcastStatusToFriends(
    friends: User[],
    userHexCode: string,
    status: 'online' | 'offline'
  ): Promise<void> {
    const notifications = friends.map((friend) =>
      this.notifyFriendStatusChanged(friend, userHexCode, status)
    );

    await Promise.all(notifications);
    console.log(`📡 Broadcasted ${status} status to ${friends.length} friends`);
  }

  /**
   * Send message received notification (regular push)
   * Used when recipient does not have Live Activity enabled
   */
  async notifyMessageReceived(
    recipient: User,
    senderName: string,
    messageText: string,
    messageId: string
  ): Promise<void> {
    // Truncate message preview to 100 characters
    const preview = messageText.length > 100 
      ? messageText.substring(0, 97) + '...' 
      : messageText;

    await queueNotification({
      type: 'alert',
      userId: recipient.id,
      notification: {
        deviceToken: recipient.deviceToken,
        alert: {
          title: `📟 ${senderName}`,
          body: preview,
          sound: 'default',
        },
        badge: 1,
        data: {
          type: 'MESSAGE',
          messageId,
          senderName,
        },
      },
    });
  }

  /**
   * Send message received via Live Activity push-to-start
   * Used when recipient has Live Activity enabled
   * Requirements: 9.4, 9.5, 9.7, 16.3 - Auto-start Live Activity and handle fallback
   * 
   * IMPORTANT: Uses liveActivityToken (push-to-start token), NOT deviceToken!
   */
  async notifyMessageReceivedViaLiveActivity(
    recipient: User,
    senderName: string,
    messageText: string,
    messageId: string
  ): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[LA TOKEN FLOW] Step 5: Preparing Live Activity notification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[LA TOKEN FLOW] Recipient:', recipient.hexCode);
    console.log('[LA TOKEN FLOW] Sender:', senderName);
    console.log('[LA TOKEN FLOW] Message ID:', messageId);
    
    // Log token information
    console.log('[LA TOKEN FLOW] Token Check:');
    console.log('[LA TOKEN FLOW]   - Device Token (for regular push):', recipient.deviceToken ? recipient.deviceToken.substring(0, 20) + '...' : 'null');
    console.log('[LA TOKEN FLOW]   - Live Activity Token (push-to-start):', recipient.liveActivityToken ? recipient.liveActivityToken.substring(0, 32) + '...' : 'null');
    
    // Requirements: 9.7 - Check if LA token is valid before sending
    if (!this.isValidLAToken(recipient.liveActivityToken)) {
      console.log('[LA TOKEN FLOW] ❌ No valid Live Activity token for recipient');
      console.log('[LA TOKEN FLOW] Falling back to regular push notification');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      // Fall back to regular push if no valid LA token
      return this.notifyMessageReceived(recipient, senderName, messageText, messageId);
    }

    console.log('[LA TOKEN FLOW] ✅ Valid Live Activity token found');
    console.log('[LA TOKEN FLOW] Using: liveActivityToken (NOT deviceToken)');

    // Truncate message to 100 characters for Live Activity display
    const truncatedMessage = messageText.length > 100 
      ? messageText.substring(0, 97) + '...' 
      : messageText;

    try {
      // Live Activity push-to-start notification
      // Requirements: 9.4, 9.5 - Send push-to-start to auto-start Live Activity
      console.log('[LA TOKEN FLOW] Queueing Live Activity push-to-start notification...');
      console.log('[LA TOKEN FLOW] Content State:');
      console.log('[LA TOKEN FLOW]   - sender:', senderName);
      console.log('[LA TOKEN FLOW]   - message:', truncatedMessage.substring(0, 50) + (truncatedMessage.length > 50 ? '...' : ''));
      console.log('[LA TOKEN FLOW]   - isDemo: false');
      
      await queueNotification({
        type: 'liveactivity',
        userId: recipient.id,
        notification: {
          // Regular notification as fallback data
          deviceToken: recipient.deviceToken,
        },
        liveActivityNotification: {
          pushToken: recipient.liveActivityToken!,
          contentState: {
            sender: senderName,
            message: truncatedMessage,
            timestamp: Math.floor(Date.now() / 1000),  // Unix timestamp in seconds for Swift Date decoding
            isDemo: false,
            messageIndex: 1,
            totalMessages: 1,
          },
          alert: {
            title: senderName,
            body: truncatedMessage,
            sound: 'default',
          },
        },
      });
      console.log('[LA TOKEN FLOW] ✅ Live Activity notification queued successfully');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      // Requirements: 9.7, 16.3 - Handle LA token failure and fallback
      console.error('[LA TOKEN FLOW] ❌ Live Activity notification failed:', error);
      
      // Check if error indicates invalid token
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isInvalidToken = 
        errorMessage.includes('BadDeviceToken') ||
        errorMessage.includes('Unregistered') ||
        errorMessage.includes('ExpiredToken') ||
        errorMessage.includes('InvalidToken');
      
      if (isInvalidToken) {
        // Requirements: 16.3 - Remove invalid token from storage
        console.log('[LA TOKEN FLOW] Token appears invalid, clearing from database');
        this.clearLiveActivityToken(recipient.id);
      }
      
      // Requirements: 9.7 - Fall back to regular push notification
      console.log('[LA TOKEN FLOW] Falling back to regular push notification');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      await this.notifyMessageReceived(recipient, senderName, messageText, messageId);
    }
  }

  /**
   * Send message with automatic Live Activity fallback
   * This is the main entry point for sending message notifications
   * Requirements: 8.1, 8.5, 9.4, 9.7, 15.3, 15.4
   */
  async sendMessageNotification(
    recipient: User,
    senderName: string,
    messageText: string,
    messageId: string
  ): Promise<void> {
    // Requirements: 8.5, 9.4 - Check if recipient has Live Activity enabled
    if (this.isValidLAToken(recipient.liveActivityToken)) {
      // Try Live Activity first (with automatic fallback on failure)
      await this.notifyMessageReceivedViaLiveActivity(
        recipient,
        senderName,
        messageText,
        messageId
      );
    } else {
      // Requirements: 8.1, 15.4 - Send regular push notification
      await this.notifyMessageReceived(recipient, senderName, messageText, messageId);
    }
  }
}
