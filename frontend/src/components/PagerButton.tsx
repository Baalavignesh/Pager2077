import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface PagerButtonProps {
  label: string;
  onPress: () => void;
  isNavButton?: boolean;
  style?: object;
}

export const PagerButton: React.FC<PagerButtonProps> = ({ label, onPress, isNavButton = false, style }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, isNavButton ? styles.navButton : styles.actionButton, style]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A4A4A',
    borderWidth: 3,
    borderRadius: 10,
    borderColor: '#2A2A2A',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',

  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'MyPager',
  },
  actionButton: {
    width: 112,
  },
  navButton: {
    width: 80,
    marginHorizontal: 12,
  },
});
