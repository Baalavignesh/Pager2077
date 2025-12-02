import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameControlsProps {
  controlText: string;
}

export const GameControls: React.FC<GameControlsProps> = ({ controlText }) => {
  return (
    <View style={styles.controls}>
      <Text style={styles.controlText}>{controlText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#3d3d3d',
    alignItems: 'center',
  },
  controlText: {
    fontFamily: 'Chicago',
    fontSize: 8,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
  },
});
