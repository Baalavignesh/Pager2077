import React, { useEffect, useState } from 'react';
import { LeaderboardView } from '../components/games/LeaderboardView';
import { getFriendsLeaderboard } from '../services/gameService';
import type { FriendsLeaderboardEntry } from '../types';

/**
 * TetrisLeaderboardScreen - Displays friends leaderboard for Tetris game
 * Uses the shared LeaderboardView component in 'friends' mode
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const TetrisLeaderboardScreen: React.FC = () => {
  const [scores, setScores] = useState<FriendsLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Requirement 4.1: Fetch friends leaderboard from API
        const leaderboard = await getFriendsLeaderboard('tetris');
        setScores(leaderboard);
      } catch (err) {
        console.error('Failed to load tetris leaderboard:', err);
        setError('UNABLE TO LOAD');
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <LeaderboardView
        title="TETRIS SCORES"
        scores={[]}
        emptyMessage="LOADING..."
        mode="friends"
      />
    );
  }

  // Show error state with retry hint
  if (error) {
    return (
      <LeaderboardView
        title="TETRIS SCORES"
        scores={[]}
        emptyMessage={error}
        mode="friends"
      />
    );
  }

  // Requirement 4.2, 4.3, 4.4: Display leaderboard with highlighting
  return (
    <LeaderboardView
      title="TETRIS SCORES"
      scores={scores}
      emptyMessage="NO FRIENDS HAVE SCORES"
      mode="friends"
    />
  );
};
