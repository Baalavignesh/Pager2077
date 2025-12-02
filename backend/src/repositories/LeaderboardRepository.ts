/**
 * Leaderboard Repository - Database operations for high scores
 */
import type Database from 'better-sqlite3';
import type { HighScore, GameId } from '../models';

export class LeaderboardRepository {
  constructor(private db: Database.Database) {}

  /**
   * Get user's high score for a specific game
   * Returns null if no score exists
   */
  getUserScore(userId: string, game: GameId): HighScore | null {
    const stmt = this.db.prepare(`
      SELECT user_id, game, score, updated_at
      FROM high_scores
      WHERE user_id = ? AND game = ?
    `);

    const row = stmt.get(userId, game) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToHighScore(row);
  }

  /**
   * Upsert score - only updates if new score is strictly higher than existing
   * Creates new record if none exists
   * Returns the current high score after operation
   */
  upsertScore(userId: string, game: GameId, score: number): HighScore {
    const now = new Date().toISOString();

    // Use INSERT OR REPLACE with a subquery to only update if score is higher
    // This ensures atomicity and the single record invariant
    const stmt = this.db.prepare(`
      INSERT INTO high_scores (user_id, game, score, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, game) DO UPDATE SET
        score = CASE WHEN excluded.score > high_scores.score THEN excluded.score ELSE high_scores.score END,
        updated_at = CASE WHEN excluded.score > high_scores.score THEN excluded.updated_at ELSE high_scores.updated_at END
    `);

    stmt.run(userId, game, score, now);

    // Return the current score (which may or may not have been updated)
    const result = this.getUserScore(userId, game);
    
    // This should never be null after an upsert, but TypeScript needs assurance
    if (!result) {
      throw new Error('Failed to retrieve score after upsert');
    }

    return result;
  }

  /**
   * Get high scores for a list of user IDs for a specific game
   * Used for batch retrieval when building leaderboards
   */
  getScoresForUsers(userIds: string[], game: GameId): HighScore[] {
    if (userIds.length === 0) {
      return [];
    }

    // Build parameterized query with placeholders for each user ID
    const placeholders = userIds.map(() => '?').join(', ');
    const stmt = this.db.prepare(`
      SELECT user_id, game, score, updated_at
      FROM high_scores
      WHERE user_id IN (${placeholders}) AND game = ?
      ORDER BY score DESC
    `);

    const rows = stmt.all(...userIds, game) as any[];
    return rows.map(row => this.mapRowToHighScore(row));
  }

  /**
   * Map database row to HighScore object
   */
  private mapRowToHighScore(row: any): HighScore {
    return {
      userId: row.user_id,
      game: row.game as GameId,
      score: row.score,
      updatedAt: new Date(row.updated_at),
    };
  }
}
