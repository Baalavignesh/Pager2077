import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameHeaderProps {
  title: string;
  score: number;
  level?: number;
  extraInfo?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  score,
  level,
  extraInfo,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
        {level !== undefined && (
          <Text style={styles.level}>LV:{level}</Text>
        )}
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.score}>
          SCORE: {score.toString().padStart(4, '0')}
        </Text>
        {extraInfo && (
          <Text style={styles.extraInfo}>{extraInfo}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3d3d3d',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  level: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  score: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  extraInfo: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
