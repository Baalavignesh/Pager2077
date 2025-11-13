import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Message {
  from: string;
  text: string;
  time: string;
}

interface MessagesScreenProps {
  messages: Message[];
  selectedIndex: number;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ messages, selectedIndex }) => {
  return (
    <View>
      <Text style={styles.title}>MESSAGES</Text>
      <Text> </Text>
      {messages.length === 0 ? (
        <Text style={styles.item}>NO MESSAGES</Text>
      ) : (
        messages.map((msg, index) => (
          <Text
            key={index}
            style={[
              styles.item,
              index === selectedIndex ? styles.itemSelected : styles.itemUnselected
            ]}
          >
            {index === selectedIndex ? '>' : ' '} {msg.from}
          </Text>
        ))
      )}
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
  item: {
    fontSize: 14,
    paddingHorizontal: 4,
    fontFamily: 'MyPager',
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
