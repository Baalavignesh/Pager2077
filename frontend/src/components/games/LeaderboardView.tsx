import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../PagerScreen';

export interface LeaderboardEntry {
  score: number;
  date: string;
}

interface LeaderboardViewProps {
  title: string;
  scores: LeaderboardEntry[];
  emptyMessage?: string;
}

/**
 * Shared leaderboard view component for displaying ranked scores with dates.
 * Used by Snake, Tetris, and future game leaderboard screens.
 */
export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  title,
  scores,
  emptyMessage = 'NO SCORES YET',
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  };

  return (
    <PagerScreen title={title} scrollable>
      {scores.length === 0 ? (
        <PagerText>{emptyMessage}</PagerText>
      ) : (
        scores.slice(0, 10).map((entry, index) => (
          <View key={index} style={styles.row}>
            <PagerText style={styles.rank}>
              {(index + 1).toString().padStart(2, ' ')}.
            </PagerText>
            <PagerText style={styles.score}>
              {entry.score.toString().padStart(4, '0')}
            </PagerText>
            <PagerText style={styles.date}>
              {formatDate(entry.date)}
            </PagerText>
          </View>
        ))
      )}
    </PagerScreen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  rank: {
    width: 40,
    margin: 0,
  },
  score: {
    flex: 1,
    textAlign: 'center',
    margin: 0,
  },
  date: {
    width: 60,
    textAlign: 'right',
    margin: 0,
  },
});
