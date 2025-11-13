import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SettingsScreen: React.FC = () => {
  return (
    <View>
      <Text style={styles.title}>SETTINGS</Text>
      <Text> </Text>
      <Text style={styles.item}>1. SOUND: ON</Text>
      <Text style={styles.item}>2. VIBRATE: ON</Text>
      <Text style={styles.item}>3. ABOUT</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  item: {
    fontSize: 14,
    paddingHorizontal: 4,
    color: '#1A1A1A',
  },
});
