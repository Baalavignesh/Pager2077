/**
 * Game Service - Storage for game scores and leaderboards
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SNAKE_LEADERBOARD: 'snakeLeaderboard',
};

export interface LeaderboardEntry {
  score: number;
  date: string;
}

/**
 * Get snake game leaderboard
 */
export async function getSnakeLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SNAKE_LEADERBOARD);
    if (!json) return [];
    const scores = JSON.parse(json) as LeaderboardEntry[];
    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Failed to load snake leaderboard:', error);
    return [];
  }
}

/**
 * Add a new score to the snake leaderboard
 * Keeps top 10 scores only
 */
export async function addSnakeScore(score: number): Promise<void> {
  try {
    const scores = await getSnakeLeaderboard();
    const newEntry: LeaderboardEntry = {
      score,
      date: new Date().toISOString(),
    };
    
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    const topScores = scores.slice(0, 10);
    
    await AsyncStorage.setItem(KEYS.SNAKE_LEADERBOARD, JSON.stringify(topScores));
  } catch (error) {
    console.error('Failed to save snake score:', error);
  }
}

/**
 * Clear all snake scores
 */
export async function clearSnakeLeaderboard(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SNAKE_LEADERBOARD);
  } catch (error) {
    console.error('Failed to clear snake leaderboard:', error);
  }
}

/**
 * Check if score qualifies for leaderboard (top 10)
 */
export async function isHighScore(score: number): Promise<boolean> {
  const scores = await getSnakeLeaderboard();
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}
