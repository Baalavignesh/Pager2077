import React, { useEffect, useState } from 'react';
import { LeaderboardView } from '../components/games/LeaderboardView';
import { getFriendsLeaderboard } from '../services/gameService';
import type { FriendsLeaderboardEntry } from '../types';

/**
 * SnakeLeaderboardScreen - Displays friends leaderboard for Snake game
 * Uses the shared LeaderboardView component in 'friends' mode
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const SnakeLeaderboardScreen: React.FC = () => {
  const [scores, setScores] = useState<FriendsLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Requirement 4.1: Fetch friends leaderboard from API
        const leaderboard = await getFriendsLeaderboard('snake');
        setScores(leaderboard);
      } catch (err) {
        console.error('Failed to load snake leaderboard:', err);
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
        title="SNAKE SCORES"
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
        title="SNAKE SCORES"
        scores={[]}
        emptyMessage={error}
        mode="friends"
      />
    );
  }

  // Requirement 4.2, 4.3, 4.4: Display leaderboard with highlighting
  return (
    <LeaderboardView
      title="SNAKE SCORES"
      scores={scores}
      emptyMessage="NO FRIENDS HAVE SCORES"
      mode="friends"
    />
  );
};
