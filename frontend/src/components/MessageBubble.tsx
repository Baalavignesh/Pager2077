import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  senderName: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSent,
  senderName,
}) => {
  const time = formatTimestamp(message.timestamp);

  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      {!isSent && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
        {message.text}
      </Text>
      <Text style={[styles.timestamp, isSent ? styles.sentTimestamp : styles.receivedTimestamp]}>
        {time}
      </Text>
    </View>
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
  container: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#3d3d3dff',
  },
  sentContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a2618',
    maxWidth: '80%',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    maxWidth: '80%',
  },
  senderName: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700',
    color: '#1a2618',
    marginBottom: 4,
    letterSpacing: 1,
  },
  messageText: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 18,
  },
  sentText: {
    color: '#8B9D7F',
  },
  receivedText: {
    color: '#1a2618',
  },
  timestamp: {
    fontFamily: 'Chicago',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
  sentTimestamp: {
    color: '#8B9D7F',
    opacity: 0.7,
  },
  receivedTimestamp: {
    color: '#1a2618',
    opacity: 0.6,
  },
});
