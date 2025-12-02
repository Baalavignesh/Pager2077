import React from 'react';
import { LeaderboardView, LeaderboardEntry } from '../components/games';

interface SnakeLeaderboardScreenProps {
  scores: LeaderboardEntry[];
}

export const SnakeLeaderboardScreen: React.FC<SnakeLeaderboardScreenProps> = ({ scores }) => {
  return (
    <LeaderboardView
      title="HIGH SCORES"
      scores={scores}
      emptyMessage="NO SCORES YET"
    />
  );
};
