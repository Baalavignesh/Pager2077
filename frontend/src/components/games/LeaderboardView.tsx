import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../PagerScreen';
import type { FriendsLeaderboardEntry } from '../../types';

// Local leaderboard entry (for backward compatibility)
export interface LeaderboardEntry {
  score: number;
  date: string;
}

// Props for local leaderboard display
interface LocalLeaderboardViewProps {
  title: string;
  scores: LeaderboardEntry[];
  emptyMessage?: string;
  mode?: 'local';
}

// Props for friends leaderboard display
interface FriendsLeaderboardViewProps {
  title: string;
  scores: FriendsLeaderboardEntry[];
  emptyMessage?: string;
  mode: 'friends';
}

type LeaderboardViewProps = LocalLeaderboardViewProps | FriendsLeaderboardViewProps;

/**
 * Shared leaderboard view component for displaying ranked scores.
 * Supports two modes:
 * - 'local': Display local scores with rank, score, and date
 * - 'friends': Display friends leaderboard with rank, name/hex, score, date, and current user highlighting
 * 
 * Requirements: 4.2, 4.3, 4.4
 */
export const LeaderboardView: React.FC<LeaderboardViewProps> = (props) => {
  const { title, scores, emptyMessage = 'NO SCORES YET' } = props;
  const mode = props.mode || 'local';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  };

  // Render local leaderboard entry
  const renderLocalEntry = (entry: LeaderboardEntry, index: number) => (
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
  );

  // Render friends leaderboard entry with current user highlighting
  // Requirements: 4.2 (display rank, name, score), 4.3 (highlight current user)
  const renderFriendsEntry = (entry: FriendsLeaderboardEntry) => {
    const displayName = entry.displayName || entry.hexCode;
    // Truncate name to 6 chars to fit 5-digit scores on single line
    const truncatedName = displayName.length > 6 
      ? displayName.substring(0, 5) + '…' 
      : displayName;

    return (
      <View 
        key={entry.userId} 
        style={[styles.row, entry.isCurrentUser && styles.currentUserRow]}
      >
        <PagerText 
          style={[styles.friendsRank, entry.isCurrentUser && styles.currentUserText]}
          selected={entry.isCurrentUser}
        >
          {entry.rank}.
        </PagerText>
        <PagerText 
          style={[styles.name, entry.isCurrentUser && styles.currentUserText]}
          selected={entry.isCurrentUser}
        >
          {truncatedName}
        </PagerText>
        <PagerText 
          style={[styles.friendsScore, entry.isCurrentUser && styles.currentUserText]}
          selected={entry.isCurrentUser}
        >
          {entry.score}
        </PagerText>
      </View>
    );
  };

  // Determine empty message based on mode
  // Requirement 4.4: Show appropriate empty state message
  const getEmptyMessage = () => {
    if (emptyMessage !== 'NO SCORES YET') return emptyMessage;
    return mode === 'friends' ? 'NO FRIENDS HAVE SCORES' : 'NO SCORES YET';
  };

  return (
    <PagerScreen title={title} scrollable>
      {scores.length === 0 ? (
        <PagerText>{getEmptyMessage()}</PagerText>
      ) : mode === 'friends' ? (
        (scores as FriendsLeaderboardEntry[]).map(renderFriendsEntry)
      ) : (
        (scores as LeaderboardEntry[]).slice(0, 10).map(renderLocalEntry)
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
  currentUserRow: {
    marginVertical: 4,
    borderRadius: 0,
  },
  rank: {
    width: 40,
    margin: 0,
  },
  friendsRank: {
    width: 28,
    margin: 0,
  },
  name: {
    flex: 1,
    margin: 0,
  },
  score: {
    flex: 1,
    textAlign: 'center',
    margin: 0,
  },
  friendsScore: {
    width: 70,
    textAlign: 'right',
    margin: 0,
  },
  date: {
    width: 60,
    textAlign: 'right',
    margin: 0,
  },
  currentUserText: {
    // PagerText with selected={true} handles the highlighting
  },
});
