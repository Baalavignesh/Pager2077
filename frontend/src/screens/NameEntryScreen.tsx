import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';
import { T9InputHandler } from '../utils/t9Input';
import { validateDisplayName } from '../services/displayNameService';

interface NameEntryScreenProps {
  onComplete: (displayName: string) => void;
  onSkip?: () => void;
}

export interface NameEntryScreenHandle {
  handleNumberPress: (key: string) => void;
  handleBackspace: () => void;
  handleSubmit: () => void;
}

export const NameEntryScreen = forwardRef<NameEntryScreenHandle, NameEntryScreenProps>(({ 
  onComplete,
  onSkip 
}, ref) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const t9Handler = useRef(new T9InputHandler());

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      t9Handler.current.cleanup();
    };
  }, []);

  const handleNumberPress = (key: string) => {
    setError(null);
    const newInput = t9Handler.current.handleKeyPress(key);
    setInput(newInput);
  };

  const handleBackspace = () => {
    setError(null);
    const newInput = t9Handler.current.handleBackspace();
    setInput(newInput);
  };

  const handleSubmit = async () => {
    // Validate
    const validation = validateDisplayName(input);
    if (!validation.valid) {
      setError(validation.error || 'INVALID NAME');
      return;
    }

    // Submit
    setIsProcessing(true);
    try {
      await onComplete(input);
    } catch (err) {
      setError('FAILED TO SAVE NAME');
      setIsProcessing(false);
    }
  };

  const handleSkipPress = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    handleNumberPress,
    handleBackspace,
    handleSubmit,
  }));

  // Format input for display (show cursor position)
  const displayInput = input || '_';

  if (isProcessing) {
    return (
      <PagerScreen title="ENTER NAME">
        <PagerText> </PagerText>
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>SAVING...</PagerText>
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="ENTER NAME">
      <PagerText>ENTER YOUR NAME:</PagerText>
      <PagerText> </PagerText>
      
      <PagerText style={{ textAlign: 'center' }}>
        {displayInput}
      </PagerText>

      <PagerText> </PagerText>
      
      {error ? (
        <>
          <PagerText>ERROR: {error}</PagerText>
          <PagerText> </PagerText>
        </>
      ) : null}
      
      <PagerText>USE NUMPAD TO TYPE</PagerText>
      <PagerText>PRESS KEY MULTIPLE</PagerText>
      <PagerText>TIMES FOR LETTERS</PagerText>
      <PagerText> </PagerText>
      <PagerText>CALL: SAVE</PagerText>
      <PagerText># : BACKSPACE</PagerText>
      <PagerText>BACK: SKIP</PagerText>
    </PagerScreen>
  );
});

const styles = StyleSheet.create({
  spacer: {
    height: 8,
  },
});
