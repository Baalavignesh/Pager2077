import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { PagerScreen, PagerText } from '../components/PagerScreen';
import { useAuth } from '../context/AuthContext';

export interface MyHexScreenHandle {
  handleCopyToClipboard: () => Promise<void>;
}

export const MyHexScreen = forwardRef<MyHexScreenHandle>((_, ref) => {
  const { hexCode } = useAuth();
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopyToClipboard = async () => {
    if (hexCode) {
      await Clipboard.setStringAsync(hexCode);
      setCopyStatus('COPIED!');
      // Clear status after 2 seconds
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  useImperativeHandle(ref, () => ({
    handleCopyToClipboard,
  }));

  return (
    <PagerScreen title="MY HEX CODE">
      <PagerText style={styles.centered}>{hexCode || 'LOADING...'}</PagerText>
      <Text> </Text>
      {copyStatus ? (
        <PagerText style={styles.centered}>{copyStatus}</PagerText>
      ) : (
        <>
          <PagerText style={styles.centered}>SHARE THIS CODE</PagerText>
          <PagerText style={styles.centered}>WITH FRIENDS</PagerText>
        </>
      )}
      <Text> </Text>
      <PagerText style={styles.centered}>CALL: COPY</PagerText>
    </PagerScreen>
  );
});

// Screen-specific styles (only when needed)
const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
