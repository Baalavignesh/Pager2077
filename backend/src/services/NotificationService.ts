/**
 * Notification Service - High-level notification API
 * Uses Redis queue for reliable delivery
 */
import { queueNotification } from '../queue/notificationQueue';
import type { User } from '../models';

export class NotificationService {
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
   */
  async notifyMessageReceivedViaLiveActivity(
    recipient: User,
    senderName: string,
    messageText: string,
    messageId: string
  ): Promise<void> {
    if (!recipient.liveActivityToken) {
      // Fall back to regular push if no LA token
      return this.notifyMessageReceived(recipient, senderName, messageText, messageId);
    }

    // Live Activity push-to-start notification
    // Uses the Live Activity token instead of device token
    await queueNotification({
      type: 'alert',
      userId: recipient.id,
      notification: {
        deviceToken: recipient.liveActivityToken,
        alert: {
          title: senderName,
          body: messageText,
          sound: 'default',
        },
        data: {
          type: 'LIVE_ACTIVITY_START',
          messageId,
          senderName,
          messageText,
          // Content state for Live Activity
          contentState: {
            senderName,
            messageText,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });
  }
}
