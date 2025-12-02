import React, { useEffect, useState } from 'react';
import { LeaderboardView, LeaderboardEntry } from '../components/games/LeaderboardView';
import { getTetrisLeaderboard } from '../services/gameService';

/**
 * TetrisLeaderboardScreen - Displays top 10 Tetris high scores
 * Uses the shared LeaderboardView component for consistent styling
 * Requirements: 5.1, 5.3
 */
export const TetrisLeaderboardScreen: React.FC = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadScores = async () => {
      const leaderboard = await getTetrisLeaderboard();
      setScores(leaderboard);
    };
    loadScores();
  }, []);

  return (
    <LeaderboardView
      title="TETRIS SCORES"
      scores={scores}
      emptyMessage="NO TETRIS SCORES YET"
    />
  );
};
