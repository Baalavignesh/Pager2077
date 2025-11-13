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
    backgroundColor: '#dadadaff',
    borderWidth: 8,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    height: '45%',
    marginTop: 100,
  },
});
