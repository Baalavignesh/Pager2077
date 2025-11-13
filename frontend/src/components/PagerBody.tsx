import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PagerBodyProps {
  children: React.ReactNode;
}

export const PagerBody: React.FC<PagerBodyProps> = ({ children }) => {
  return (
    <View style={styles.display}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  display: {
    backgroundColor: '#252525ff',
    borderWidth: 0,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 20,
    height: '40%',
  },
});
