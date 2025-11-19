import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';
import { useAuth } from '../context/AuthContext';

export const MyHexScreen: React.FC = () => {
  const { hexCode } = useAuth();

  return (
    <PagerScreen title="MY HEX CODE">
      <PagerText style={styles.centered}>{hexCode || 'LOADING...'}</PagerText>
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
