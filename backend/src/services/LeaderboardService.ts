/**
 * Leaderboard Service - Business logic for score management and leaderboard retrieval
 */
import { LeaderboardRepository } from '../repositories/LeaderboardRepository';
import { FriendshipRepository } from '../repositories/FriendshipRepository';
import { UserRepository } from '../repositories/UserRepository';
import type { HighScore, LeaderboardEntry, GameId } from '../models';

export interface SubmitScoreResult {
  updated: boolean;
  score: HighScore;
}

export class LeaderboardService {
  constructor(
    private leaderboardRepo: LeaderboardRepository,
    private friendshipRepo: FriendshipRepository,
    private userRepo: UserRepository
  ) {}

  /**
   * Submit a score for a user and game
   * Only updates if the new score is strictly higher than the existing score
   * Returns whether the score was updated and the current high score
   * 
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  submitScore(userId: string, game: GameId, score: number): SubmitScoreResult {
    // Get current score to determine if update occurred
    const existingScore = this.leaderboardRepo.getUserScore(userId, game);
    
    // Upsert the score (repository handles the "only update if higher" logic)
    const resultScore = this.leaderboardRepo.upsertScore(userId, game, score);
    
    // Determine if the score was actually updated
    // Updated if: no existing score, or new score is strictly greater
    const updated = existingScore === null || score > existingScore.score;
    
    return {
      updated,
      score: resultScore,
    };
  }

  /**
   * Get friends leaderboard for a user and game
   * Includes the user's own score in the results
   * Returns entries sorted by score in descending order
   * 
   * Requirements: 2.1, 2.2, 2.3, 2.4
   */
  getFriendsLeaderboard(userId: string, game: GameId): LeaderboardEntry[] {
    // Get user's friends
    const friends = this.friendshipRepo.getUserFriends(userId);
    
    // Build list of user IDs to include (friends + self)
    const userIds = [userId, ...friends.map(f => f.id)];
    
    // Get scores for all these users
    const scores = this.leaderboardRepo.getScoresForUsers(userIds, game);
    
    // Build a map of userId -> User for quick lookup
    const userMap = new Map<string, { displayName: string | null; hexCode: string }>();
    
    // Add current user to map
    const currentUser = this.userRepo.getUserById(userId);
    if (currentUser) {
      userMap.set(userId, {
        displayName: currentUser.displayName,
        hexCode: currentUser.hexCode,
      });
    }
    
    // Add friends to map
    for (const friend of friends) {
      userMap.set(friend.id, {
        displayName: friend.displayName,
        hexCode: friend.hexCode,
      });
    }
    
    // Convert scores to leaderboard entries
    // Scores are already sorted by score DESC from the repository
    const entries: LeaderboardEntry[] = scores.map(score => {
      const user = userMap.get(score.userId);
      return {
        userId: score.userId,
        displayName: user?.displayName ?? null,
        hexCode: user?.hexCode ?? '',
        score: score.score,
        updatedAt: score.updatedAt.toISOString(),
      };
    });
    
    return entries;
  }
}
