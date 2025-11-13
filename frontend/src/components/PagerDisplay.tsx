import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PagerDisplayProps {
  children: React.ReactNode;
}

export const PagerDisplay: React.FC<PagerDisplayProps> = ({ children }) => {
  return (
    <View style={styles.outerFrame}>
      <View style={styles.display}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 16,
    margin: 16,
    marginTop: 100,
    height: '45%',
  },
  display: {
    backgroundColor: '#8B9D7F',
    borderRadius: 2,
    flex: 1,
    borderWidth: 1,
    borderColor: '#6B7D5F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
