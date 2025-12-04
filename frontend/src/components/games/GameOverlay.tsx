import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameOverlayProps {
  visible: boolean;
  statusText: string;
  instructions?: string;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  visible,
  statusText,
  instructions,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.statusText}>{statusText}</Text>
      {instructions && (
        <Text style={styles.instructions}>{instructions}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 184, 160, 0.9)',
  },
  statusText: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  instructions: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
