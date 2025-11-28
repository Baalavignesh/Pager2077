import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

interface MessageComposerProps {
  messageText: string;
  cursorPosition: number;
  sendStatus: SendStatus;
  errorMessage: string | null;
  maxLength: number;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  messageText,
  cursorPosition,
  sendStatus,
  errorMessage,
  maxLength,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Blinking cursor animation
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();

    return () => {
      blink.stop();
    };
  }, [cursorOpacity]);

  // Auto-scroll to keep cursor visible
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messageText, cursorPosition]);

  // Split text at cursor position for cursor rendering
  const textBeforeCursor = messageText.slice(0, cursorPosition);
  const textAfterCursor = messageText.slice(cursorPosition);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            {textBeforeCursor}
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
              |
            </Animated.Text>
            {textAfterCursor}
          </Text>
        </View>
      </ScrollView>

      {/* Character Counter */}
      <Text style={styles.charCount}>
        {messageText.length}/{maxLength}
      </Text>

      {/* Status Indicator */}
      {sendStatus === 'sending' && (
        <Text style={styles.statusText}>SENDING...</Text>
      )}
      {sendStatus === 'sent' && (
        <Text style={styles.statusText}>SENT</Text>
      )}
      {sendStatus === 'error' && errorMessage && (
        <Text style={[styles.statusText, styles.errorText]}>{errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    maxHeight: 150,
  },
  scrollView: {
    flex: 1,
  },
  textContainer: {
    padding: 8,
  },
  text: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1.5,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  cursor: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
  },
  charCount: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700',
    color: '#1a2618',
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 8,
    letterSpacing: 1,
  },
  statusText: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2618',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1.5,
  },
  errorText: {
    color: '#8B0000',
  },
});
