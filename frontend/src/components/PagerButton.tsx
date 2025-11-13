import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface PagerButtonProps {
  label: string;
  onPress: () => void;
  isNavButton?: boolean;
}

export const PagerButton: React.FC<PagerButtonProps> = ({ label, onPress, isNavButton = false }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, isNavButton ? styles.navButton : styles.actionButton]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A4A4A',
    borderWidth: 3,
    borderTopColor: '#6A6A6A',
    borderLeftColor: '#6A6A6A',
    borderRightColor: '#2A2A2A',
    borderBottomColor: '#2A2A2A',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  actionButton: {
    width: 112,
  },
  navButton: {
    width: 60,
    marginHorizontal: 12,
  },
});
