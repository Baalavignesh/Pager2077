/**
 * User Repository - Database operations for users
 */
import type { Database } from 'bun:sqlite';
import { randomBytes } from 'crypto';
import type { User } from '../models';

export class UserRepository {
  constructor(private db: Database) {}

  /**
   * Generate a unique 8-character hex code
   */
  private generateHexCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Generate a unique hex code that doesn't exist in database
   */
  private generateUniqueHexCode(): string {
    let hexCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      hexCode = this.generateHexCode();
      const existing = this.getUserByHexCode(hexCode);
      if (!existing) {
        return hexCode;
      }
      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Failed to generate unique hex code');
  }

  /**
   * Create a new user
   */
  createUser(deviceToken: string): User {
    const id = randomBytes(16).toString('hex');
    const hexCode = this.generateUniqueHexCode();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, hex_code, device_token, status, last_seen, created_at, updated_at)
      VALUES (?, ?, ?, 'offline', ?, ?, ?)
    `);

    stmt.run(id, hexCode, deviceToken, now, now, now);

    return {
      id,
      hexCode,
      deviceToken,
      displayName: null,
      liveActivityToken: null,
      status: 'offline',
      lastSeen: new Date(now),
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  /**
   * Get user by hex code
   */
  getUserByHexCode(hexCode: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE hex_code = ?');
    const row = stmt.get(hexCode) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  /**
   * Get user by device token
   */
  getUserByDeviceToken(deviceToken: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE device_token = ?');
    const row = stmt.get(deviceToken) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  /**
   * Update user status
   */
  updateUserStatus(userId: string, status: 'online' | 'offline'): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE users 
      SET status = ?, last_seen = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(status, now, now, userId);
  }

  /**
   * Update device token
   */
  updateDeviceToken(userId: string, deviceToken: string): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE users 
      SET device_token = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(deviceToken, now, userId);
  }

  /**
   * Update user's display name
   */
  updateDisplayName(userId: string, displayName: string | null): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE users 
      SET display_name = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(displayName, now, userId);
  }

  /**
   * Update user's Live Activity token
   */
  updateLiveActivityToken(userId: string, liveActivityToken: string | null): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE users 
      SET live_activity_token = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(liveActivityToken, now, userId);
  }

  /**
   * Get user's Live Activity token
   */
  getLiveActivityToken(userId: string): string | null {
    const stmt = this.db.prepare('SELECT live_activity_token FROM users WHERE id = ?');
    const row = stmt.get(userId) as { live_activity_token: string | null } | undefined;

    if (!row) {
      return null;
    }

    return row.live_activity_token;
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
