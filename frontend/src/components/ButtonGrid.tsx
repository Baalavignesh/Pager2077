import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PagerButton } from './PagerButton';
import { RubberButton } from './RubberButton';

interface ButtonGridProps {
  onSelect: () => void;
  onBack: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
}

export const ButtonGrid: React.FC<ButtonGridProps> = ({ 
  onSelect, 
  onBack, 
  onNavigateUp, 
  onNavigateDown 
}) => {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <PagerButton label="SELECT" onPress={onSelect} style={styles.button} />
        <PagerButton label="BACK" onPress={onBack} style={styles.button} />
      </View>
      <View style={styles.row}>
        <PagerButton label="▲" onPress={onNavigateUp} style={styles.button} />
        <PagerButton label="▼" onPress={onNavigateDown} style={styles.button} />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    marginTop: 28
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    maxWidth: 112,
  },
});
