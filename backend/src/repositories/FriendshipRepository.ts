/**
 * Friendship Repository - Database operations for friend requests and friendships
 */
import type Database from 'better-sqlite3';
import { randomBytes } from 'crypto';
import type { FriendRequest, Friendship, User } from '../models';

/**
 * Helper to sort two user IDs consistently (smaller ID first)
 */
function sortUserIds(userId1: string, userId2: string): [string, string] {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

export class FriendshipRepository {
  constructor(private db: Database.Database) {}

  /**
   * Create a friend request
   */
  createFriendRequest(fromUserId: string, toUserId: string): FriendRequest {
    const id = randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    console.log(`[FriendshipRepo] Creating friend request: from=${fromUserId}, to=${toUserId}`);

    const stmt = this.db.prepare(`
      INSERT INTO friend_requests (id, from_user_id, to_user_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `);

    stmt.run(id, fromUserId, toUserId, now, now);
    
    console.log(`[FriendshipRepo] Friend request created with id: ${id}`);

    return {
      id,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * Get friend request by ID
   */
  getFriendRequestById(id: string): FriendRequest | null {
    const stmt = this.db.prepare('SELECT * FROM friend_requests WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToFriendRequest(row);
  }

  /**
   * Get pending friend requests for a user
   */
  getPendingRequests(userId: string): FriendRequest[] {
    console.log(`[FriendshipRepo] Getting pending requests for user: ${userId}`);
    
    const stmt = this.db.prepare(`
      SELECT * FROM friend_requests 
      WHERE to_user_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    console.log(`[FriendshipRepo] Found ${rows.length} pending requests`);
    rows.forEach(row => {
      console.log(`[FriendshipRepo]   Request: from=${row.from_user_id}, to=${row.to_user_id}`);
    });
    
    return rows.map(row => this.mapRowToFriendRequest(row));
  }

  /**
   * Check if friend request already exists
   */
  friendRequestExists(fromUserId: string, toUserId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM friend_requests 
      WHERE from_user_id = ? AND to_user_id = ?
    `);

    const result = stmt.get(fromUserId, toUserId) as any;
    return result.count > 0;
  }

  /**
   * Update friend request status
   */
  updateFriendRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected'
  ): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE friend_requests 
      SET status = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(status, now, requestId);
  }

  /**
   * Create a friendship (bidirectional)
   */
  createFriendship(userId1: string, userId2: string): Friendship {
    const id = randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    // Ensure consistent ordering (smaller ID first)
    const [smallerId, largerId] = sortUserIds(userId1, userId2);

    const stmt = this.db.prepare(`
      INSERT INTO friendships (id, user_id_1, user_id_2, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, smallerId, largerId, now);

    return {
      id,
      userId1: smallerId,
      userId2: largerId,
      createdAt: new Date(now),
    };
  }

  /**
   * Check if friendship exists between two users
   */
  friendshipExists(userId1: string, userId2: string): boolean {
    const [smallerId, largerId] = sortUserIds(userId1, userId2);

    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM friendships 
      WHERE user_id_1 = ? AND user_id_2 = ?
    `);

    const result = stmt.get(smallerId, largerId) as any;
    return result.count > 0;
  }

  /**
   * Get all friends for a user (with user details)
   */
  getUserFriends(userId: string): User[] {
    const stmt = this.db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN friendships f ON (
        (f.user_id_1 = ? AND f.user_id_2 = u.id) OR
        (f.user_id_2 = ? AND f.user_id_1 = u.id)
      )
      ORDER BY u.hex_code
    `);

    const rows = stmt.all(userId, userId) as any[];
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Delete friendship
   */
  deleteFriendship(userId1: string, userId2: string): void {
    const [smallerId, largerId] = sortUserIds(userId1, userId2);

    const stmt = this.db.prepare(`
      DELETE FROM friendships 
      WHERE user_id_1 = ? AND user_id_2 = ?
    `);

    stmt.run(smallerId, largerId);
  }

  /**
   * Map database row to FriendRequest object
   */
  private mapRowToFriendRequest(row: any): FriendRequest {
    return {
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map database row to User object
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      hexCode: row.hex_code,
      deviceToken: row.device_token,
      displayName: row.display_name || null,
      liveActivityToken: row.live_activity_token || null,
      status: row.status,
      lastSeen: new Date(row.last_seen),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
