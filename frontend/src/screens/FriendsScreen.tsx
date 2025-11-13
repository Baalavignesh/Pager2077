import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Friend {
  hexCode: string;
  status: string;
}

interface FriendsScreenProps {
  friends: Friend[];
  selectedIndex: number;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ friends, selectedIndex }) => {
  return (
    <View>
      <Text style={styles.title}>FRIENDS</Text>
      <Text> </Text>
      {friends.map((friend, index) => (
        <Text 
          key={friend.hexCode} 
          style={[
            styles.item,
            index === selectedIndex ? styles.itemSelected : styles.itemUnselected
          ]}
        >
          {index === selectedIndex ? '>' : ' '} {friend.hexCode}
        </Text>
      ))}
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
  },
  itemSelected: {
    color: '#9CB4A8',
    backgroundColor: '#1A1A1A',
  },
  itemUnselected: {
    color: '#1A1A1A',
    backgroundColor: 'transparent',
  },
});
