import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MyHexScreen: React.FC = () => {
  return (
    <View>
      <Text style={styles.title}>MY HEX CODE</Text>
      <Text> </Text>
      <Text style={styles.text}>A1B2C3D4</Text>
      <Text> </Text>
      <Text style={styles.text}>SHARE THIS CODE</Text>
      <Text style={styles.text}>WITH FRIENDS</Text>
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
    fontFamily: 'MyPager',
  },
  text: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'MyPager',
  },
});
