/**
 * Message Repository - Database operations for messages
 */
import type Database from 'better-sqlite3';
import { randomBytes } from 'crypto';
import type { Message } from '../models';

export class MessageRepository {
  constructor(private db: Database.Database) {}

  /**
   * Create a new message
   */
  create(senderId: string, recipientId: string, text: string): Message {
    const id = randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO messages (id, sender_id, recipient_id, text, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    stmt.run(id, senderId, recipientId, text, now);

    return {
      id,
      senderId,
      recipientId,
      text,
      isRead: false,
      createdAt: new Date(now),
    };
  }

  /**
   * Get messages between two users (conversation history)
   * Returns messages in chronological order (oldest first)
   */
  getByConversation(userId1: string, userId2: string, limit: number = 50): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND recipient_id = ?) 
         OR (sender_id = ? AND recipient_id = ?)
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId1, userId2, userId2, userId1, limit) as any[];
    
    // Reverse to get chronological order (oldest first)
    return rows.reverse().map(row => this.mapRowToMessage(row));
  }

  /**
   * Get unread message count from a specific friend
   */
  getUnreadCount(userId: string, friendId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE recipient_id = ? AND sender_id = ? AND is_read = 0
    `);

    const result = stmt.get(userId, friendId) as any;
    return result.count;
  }

  /**
   * Get total unread message count for a user
   */
  getTotalUnreadCount(userId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE recipient_id = ? AND is_read = 0
    `);

    const result = stmt.get(userId) as any;
    return result.count;
  }

  /**
   * Mark messages as read from a specific friend
   */
  markRead(userId: string, friendId: string): void {
    const stmt = this.db.prepare(`
      UPDATE messages 
      SET is_read = 1
      WHERE recipient_id = ? AND sender_id = ? AND is_read = 0
    `);

    stmt.run(userId, friendId);
  }

  /**
   * Get message by ID
   */
  getById(id: string): Message | null {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToMessage(row);
  }

  /**
   * Get the latest message in a conversation
   */
  getLatestMessage(userId1: string, userId2: string): Message | null {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND recipient_id = ?) 
         OR (sender_id = ? AND recipient_id = ?)
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId1, userId2, userId2, userId1) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToMessage(row);
  }

  /**
   * Get all conversations with unread messages for a user
   * Returns unique sender IDs with unread message counts
   */
  getConversationsWithUnread(userId: string): { senderId: string; unreadCount: number }[] {
    const stmt = this.db.prepare(`
      SELECT sender_id, COUNT(*) as unread_count 
      FROM messages 
      WHERE recipient_id = ? AND is_read = 0
      GROUP BY sender_id
      ORDER BY MAX(created_at) DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      senderId: row.sender_id,
      unreadCount: row.unread_count,
    }));
  }

  /**
   * Map database row to Message object
   */
  private mapRowToMessage(row: any): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      text: row.text,
      isRead: row.is_read === 1,
      createdAt: new Date(row.created_at),
    };
  }
}
