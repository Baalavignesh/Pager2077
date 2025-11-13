import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';

export const MyHexScreen: React.FC = () => {
  return (
    <PagerScreen title="MY HEX CODE">
      <PagerText style={styles.centered}>A1B2C3D4</PagerText>
      <Text> </Text>
      <PagerText style={styles.centered}>SHARE THIS CODE</PagerText>
      <PagerText style={styles.centered}>WITH FRIENDS</PagerText>
    </PagerScreen>
  );
};

// Screen-specific styles (only when needed)
const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
