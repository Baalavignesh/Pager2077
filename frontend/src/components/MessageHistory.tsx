import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PagerText } from './PagerScreen';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

interface MessageHistoryProps {
  messages: Message[];
  currentUserId: string;
  displayNameMap: Record<string, string>;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({
  messages,
  currentUserId,
  displayNameMap,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages added
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  // Sort messages by timestamp (oldest first)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <PagerText>NO MESSAGES YET</PagerText>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {sortedMessages.map((message) => {
        const senderName = displayNameMap[message.senderId] || message.senderId;
        const time = formatTimestamp(message.timestamp);
        
        return (
          <View key={message.id} style={styles.messageContainer}>
            <PagerText>
              {message.isSent ? '→' : '←'} {!message.isSent && `${senderName}: `}{message.text}
            </PagerText>
            <PagerText style={styles.timestamp}>
              {time}
            </PagerText>
          </View>
        );
      })}
    </ScrollView>
  );
};

/**
 * Format timestamp to HH:MM format
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    maxHeight: 200,
  },
  emptyContainer: {
    padding: 8,
  },
  messageContainer: {
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
});
