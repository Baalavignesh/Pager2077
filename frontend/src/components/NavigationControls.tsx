import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerButton } from './PagerButton';

interface NavigationControlsProps {
  onNavigateUp: () => void;
  onNavigateDown: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({ 
  onNavigateUp, 
  onNavigateDown 
}) => {
  return (
    <View style={styles.container}>
      <PagerButton label="▲" onPress={onNavigateUp} isNavButton />
      <PagerButton label="▼" onPress={onNavigateDown} isNavButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
});
