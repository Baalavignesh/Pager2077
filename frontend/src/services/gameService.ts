/**
 * Game Service - Storage for game scores and leaderboards
 * Supports multiple games (Snake, Tetris, etc.)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Game identifier type for all supported games
export type GameId = 'snake' | 'tetris';

// Storage keys for each game's leaderboard
const KEYS: Record<GameId, string> = {
  snake: 'snakeLeaderboard',
  tetris: 'tetrisLeaderboard',
};

export interface LeaderboardEntry {
  score: number;
  date: string;
}

/**
 * Get leaderboard for a specific game
 * @param gameId - The game identifier
 * @returns Array of leaderboard entries sorted by score descending
 */
export async function getLeaderboard(gameId: GameId): Promise<LeaderboardEntry[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS[gameId]);
    if (!json) return [];
    const scores = JSON.parse(json) as LeaderboardEntry[];
    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error(`Failed to load ${gameId} leaderboard:`, error);
    return [];
  }
}

/**
 * Add a new score to a game's leaderboard
 * Keeps top 10 scores only
 * @param gameId - The game identifier
 * @param score - The score to add
 */
export async function addScore(gameId: GameId, score: number): Promise<void> {
  try {
    const scores = await getLeaderboard(gameId);
    const newEntry: LeaderboardEntry = {
      score,
      date: new Date().toISOString(),
    };
    
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    const topScores = scores.slice(0, 10);
    
    await AsyncStorage.setItem(KEYS[gameId], JSON.stringify(topScores));
  } catch (error) {
    console.error(`Failed to save ${gameId} score:`, error);
  }
}

/**
 * Clear all scores for a specific game
 * @param gameId - The game identifier
 */
export async function clearLeaderboard(gameId: GameId): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS[gameId]);
  } catch (error) {
    console.error(`Failed to clear ${gameId} leaderboard:`, error);
  }
}

/**
 * Check if score qualifies for a game's leaderboard (top 10)
 * @param gameId - The game identifier
 * @param score - The score to check
 * @returns True if score qualifies for top 10
 */
export async function isHighScore(gameId: GameId, score: number): Promise<boolean> {
  const scores = await getLeaderboard(gameId);
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}

// ============================================
// Backward-compatible aliases for Snake
// ============================================

/**
 * Get snake game leaderboard
 * @deprecated Use getLeaderboard('snake') instead
 */
export const getSnakeLeaderboard = (): Promise<LeaderboardEntry[]> => 
  getLeaderboard('snake');

/**
 * Add a new score to the snake leaderboard
 * @deprecated Use addScore('snake', score) instead
 */
export const addSnakeScore = (score: number): Promise<void> => 
  addScore('snake', score);

/**
 * Clear all snake scores
 * @deprecated Use clearLeaderboard('snake') instead
 */
export const clearSnakeLeaderboard = (): Promise<void> => 
  clearLeaderboard('snake');

/**
 * Check if score qualifies for snake leaderboard
 * @deprecated Use isHighScore('snake', score) instead
 */
export const isSnakeHighScore = (score: number): Promise<boolean> => 
  isHighScore('snake', score);

// ============================================
// Tetris-specific aliases
// ============================================

/**
 * Get tetris game leaderboard
 */
export const getTetrisLeaderboard = (): Promise<LeaderboardEntry[]> => 
  getLeaderboard('tetris');

/**
 * Add a new score to the tetris leaderboard
 */
export const addTetrisScore = (score: number): Promise<void> => 
  addScore('tetris', score);

/**
 * Clear all tetris scores
 */
export const clearTetrisLeaderboard = (): Promise<void> => 
  clearLeaderboard('tetris');

/**
 * Check if score qualifies for tetris leaderboard
 */
export const isTetrisHighScore = (score: number): Promise<boolean> => 
  isHighScore('tetris', score);
