import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PagerDisplayProps {
  children: React.ReactNode;
}

export const PagerDisplay: React.FC<PagerDisplayProps> = ({ children }) => {
  return (
    <View style={styles.display}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  display: {
    backgroundColor: '#9CB4A8',
    borderWidth: 4,
    borderTopColor: '#1A1A1A',
    borderLeftColor: '#1A1A1A',
    borderRightColor: '#BCCAB8',
    borderBottomColor: '#BCCAB8',
    padding: 20,
    height: '45%',
    marginTop: 8,
  },
});
