import React from 'react';
import { View, StyleSheet } from 'react-native';

export const StatusLEDs: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.yellowLED} />
      <View style={styles.redLED} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 12,
    paddingLeft: 20,
  },
  yellowLED: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    marginRight: 16,
  },
  redLED: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
  },
});
