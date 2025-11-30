/**
 * Message Service - Business logic for messaging operations
 * Handles message creation, retrieval, and notification logic
 */
import { MessageRepository } from '../repositories/MessageRepository';
import { UserRepository } from '../repositories/UserRepository';
import { FriendshipRepository } from '../repositories/FriendshipRepository';
import { NotificationService } from './NotificationService';
import type { Message, Conversation, User } from '../models';
import { AppError } from '../utils/errors';

export class MessageService {
  constructor(
    private messageRepo: MessageRepository,
    private userRepo: UserRepository,
    private friendshipRepo: FriendshipRepository,
    private notificationService: NotificationService
  ) {}

  /**
   * Create a new message and send appropriate notification
   * Requirements: 15.1, 15.3, 15.4
   * - Creates message record
   * - Sends Live Activity push-to-start if recipient has LA token
   * - Falls back to regular push notification if no LA token
   */
  async createMessage(
    senderId: string,
    recipientId: string,
    text: string
  ): Promise<Message> {
    // Validate sender exists
    const sender = this.userRepo.getUserById(senderId);
    if (!sender) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Sender not found');
    }

    // Validate recipient exists
    const recipient = this.userRepo.getUserById(recipientId);
    if (!recipient) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Recipient not found');
    }

    // Validate users are friends
    if (!this.friendshipRepo.friendshipExists(senderId, recipientId)) {
      throw new AppError(403, 'NOT_FRIENDS', 'Users are not friends');
    }

    // Validate message text
    if (!text || text.trim().length === 0) {
      throw new AppError(400, 'INVALID_INPUT', 'Message text cannot be empty');
    }

    if (text.length > 500) {
      throw new AppError(400, 'MESSAGE_TOO_LONG', 'Message exceeds 500 characters');
    }

    // Create the message
    const message = this.messageRepo.create(senderId, recipientId, text.trim());

    // Send notification to recipient
    await this.sendMessageNotification(sender, recipient, message);

    return message;
  }

  /**
   * Get message history between two users
   * Requirements: 15.2
   */
  getMessageHistory(
    userId: string,
    friendId: string,
    limit: number = 50
  ): Message[] {
    // Validate user exists
    const user = this.userRepo.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Validate friend exists
    const friend = this.userRepo.getUserById(friendId);
    if (!friend) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Friend not found');
    }

    // Validate users are friends
    if (!this.friendshipRepo.friendshipExists(userId, friendId)) {
      throw new AppError(403, 'NOT_FRIENDS', 'Users are not friends');
    }

    // Get messages and mark as read
    const messages = this.messageRepo.getByConversation(userId, friendId, limit);
    
    // Mark messages from friend as read
    this.messageRepo.markRead(userId, friendId);

    return messages;
  }

  /**
   * Get all conversations with unread messages for a user
   * Requirements: 10.1, 10.2
   */
  getConversationsWithUnread(userId: string): Conversation[] {
    // Validate user exists
    const user = this.userRepo.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Get conversations with unread counts
    const unreadConversations = this.messageRepo.getConversationsWithUnread(userId);

    // Build full conversation objects with friend details
    const conversations: Conversation[] = [];

    for (const conv of unreadConversations) {
      const friend = this.userRepo.getUserById(conv.senderId);
      if (!friend) {
        continue; // Skip if friend no longer exists
      }

      const lastMessage = this.messageRepo.getLatestMessage(userId, conv.senderId);

      conversations.push({
        friendId: friend.id,
        friendHexCode: friend.hexCode,
        friendDisplayName: friend.displayName || null,
        lastMessage,
        unreadCount: conv.unreadCount,
      });
    }

    return conversations;
  }

  /**
   * Mark messages from a friend as read
   */
  markMessagesAsRead(userId: string, friendId: string): void {
    // Validate user exists
    const user = this.userRepo.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    this.messageRepo.markRead(userId, friendId);
  }

  /**
   * Get the latest message in a conversation
   */
  getLatestMessage(userId: string, friendId: string): Message | null {
    return this.messageRepo.getLatestMessage(userId, friendId);
  }

  /**
   * Send notification for a new message
   * Requirements: 8.1, 8.5, 9.4, 15.3, 15.4
   * - If recipient has Live Activity token: send push-to-start LA notification
   * - If no LA token: send regular push notification
   */
  private async sendMessageNotification(
    sender: User,
    recipient: User,
    message: Message
  ): Promise<void> {
    const senderName = sender.displayName || sender.hexCode;

    // Check if recipient has Live Activity token
    if (recipient.liveActivityToken) {
      // Send Live Activity push-to-start notification
      await this.sendLiveActivityNotification(recipient, senderName, message);
      console.log(`📟 Live Activity notification sent to ${recipient.hexCode}`);
    } else {
      // Fall back to regular push notification
      await this.sendRegularPushNotification(recipient, senderName, message);
      console.log(`📱 Regular push notification sent to ${recipient.hexCode}`);
    }
  }

  /**
   * Send Live Activity push-to-start notification
   * Requirements: 9.4, 15.3
   */
  private async sendLiveActivityNotification(
    recipient: User,
    senderName: string,
    message: Message
  ): Promise<void> {
    // Live Activity push-to-start uses the LA token, not device token
    // The notification payload triggers iOS to start a Live Activity
    await this.notificationService.notifyMessageReceivedViaLiveActivity(
      recipient,
      senderName,
      message.text,
      message.id
    );
  }

  /**
   * Send regular push notification
   * Requirements: 8.1, 15.4
   */
  private async sendRegularPushNotification(
    recipient: User,
    senderName: string,
    message: Message
  ): Promise<void> {
    await this.notificationService.notifyMessageReceived(
      recipient,
      senderName,
      message.text,
      message.id
    );
  }
}
