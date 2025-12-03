/**
 * Game Service - Storage for game scores and leaderboards
 * Supports multiple games (Snake, Tetris, etc.)
 * 
 * Requirements: 3.1, 3.2, 3.3 - Client-side score management
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserCredentials } from './storageService';
import type { FriendsLeaderboardEntry, ScoreSubmissionResult, ApiResponse } from '../types';

// Game identifier type for all supported games
export type GameId = 'snake' | 'tetris';

// Storage keys for each game's leaderboard
const KEYS: Record<GameId, string> = {
  snake: 'snakeLeaderboard',
  tetris: 'tetrisLeaderboard',
};

// Storage keys for local high scores
const HIGH_SCORE_KEYS: Record<GameId, string> = {
  snake: 'snakeHighScore',
  tetris: 'tetrisHighScore',
};

// API URL configuration
const API_URL = 'https://pager.baalavignesh.com';

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
// Server-side High Score API Functions
// Requirements: 3.1, 3.2, 3.3
// ============================================

/**
 * Get locally stored high score for a game
 * @param gameId - The game identifier
 * @returns The locally stored high score, or 0 if none exists
 */
export async function getLocalHighScore(gameId: GameId): Promise<number> {
  try {
    const score = await AsyncStorage.getItem(HIGH_SCORE_KEYS[gameId]);
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error(`Failed to get local high score for ${gameId}:`, error);
    return 0;
  }
}

/**
 * Save high score to local storage
 * @param gameId - The game identifier
 * @param score - The score to save
 */
async function saveLocalHighScore(gameId: GameId, score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEYS[gameId], score.toString());
  } catch (error) {
    console.error(`Failed to save local high score for ${gameId}:`, error);
  }
}

/**
 * Submit high score to server
 * Requirements: 3.1, 3.2, 3.3
 * - Only calls API if score is strictly greater than locally stored high score
 * - Updates local storage on successful submission
 * 
 * @param gameId - The game identifier
 * @param score - The score to submit
 * @returns True if score was submitted and updated on server, false otherwise
 */
export async function submitHighScore(gameId: GameId, score: number): Promise<boolean> {
  try {
    // Get locally stored high score
    const localHigh = await getLocalHighScore(gameId);
    
    // Requirement 3.2: Only call API if new score is strictly greater
    if (score <= localHigh) {
      console.log(`Score ${score} not higher than local high ${localHigh}, skipping API call`);
      return false;
    }
    
    // Get auth token
    const { authToken } = await getUserCredentials();
    if (!authToken) {
      console.error('No auth token available for score submission');
      return false;
    }
    
    // Requirement 3.1: Send score to server
    const response = await fetch(`${API_URL}/api/scores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game: gameId, score }),
    });
    
    const data: ApiResponse<ScoreSubmissionResult> = await response.json();
    
    if (!data.success || !data.data) {
      console.error('Failed to submit score:', data.error?.message);
      return false;
    }
    
    // Requirement 3.3: Update local storage on successful submission
    if (data.data.updated) {
      await saveLocalHighScore(gameId, data.data.score);
      console.log(`High score updated: ${data.data.score}`);
    }
    
    return data.data.updated;
  } catch (error) {
    // Network errors: silently fail, keep local score
    console.error(`Failed to submit high score for ${gameId}:`, error);
    return false;
  }
}

/**
 * Get friends leaderboard from server
 * @param gameId - The game identifier
 * @returns Array of leaderboard entries with rank and current user flag
 */
export async function getFriendsLeaderboard(gameId: GameId): Promise<FriendsLeaderboardEntry[]> {
  try {
    const { authToken, userId } = await getUserCredentials();
    if (!authToken) {
      console.error('No auth token available for leaderboard fetch');
      return [];
    }
    
    const response = await fetch(`${API_URL}/api/leaderboard/${gameId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const data: ApiResponse<{ entries: Array<{
      userId: string;
      displayName: string | null;
      hexCode: string;
      score: number;
      updatedAt: string;
    }> }> = await response.json();
    
    if (!data.success || !data.data) {
      console.error('Failed to fetch leaderboard:', data.error?.message);
      return [];
    }
    
    // Add rank and isCurrentUser flag
    return data.data.entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.userId === userId,
    }));
  } catch (error) {
    console.error(`Failed to fetch friends leaderboard for ${gameId}:`, error);
    return [];
  }
}

/**
 * Get current user's high score from server
 * @param gameId - The game identifier
 * @returns The user's high score, or null if none exists
 */
export async function getMyHighScore(gameId: GameId): Promise<number | null> {
  try {
    const leaderboard = await getFriendsLeaderboard(gameId);
    const myEntry = leaderboard.find(entry => entry.isCurrentUser);
    return myEntry ? myEntry.score : null;
  } catch (error) {
    console.error(`Failed to get my high score for ${gameId}:`, error);
    return null;
  }
}

/**
 * Sync local high score with server
 * Call this on app startup to ensure local storage is in sync
 * @param gameId - The game identifier
 */
export async function syncHighScore(gameId: GameId): Promise<void> {
  try {
    const serverScore = await getMyHighScore(gameId);
    if (serverScore !== null) {
      const localScore = await getLocalHighScore(gameId);
      if (serverScore > localScore) {
        await saveLocalHighScore(gameId, serverScore);
        console.log(`Synced ${gameId} high score from server: ${serverScore}`);
      }
    }
  } catch (error) {
    console.error(`Failed to sync high score for ${gameId}:`, error);
  }
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
