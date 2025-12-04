/**
 * Name Entry Screen - Initial display name setup during onboarding
 * Requirements: 11.1, 11.4 - Call backend API to save display name on completion
 *                           Handle API errors with retry option
 */
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
  handleRetry: () => void;
}

export const NameEntryScreen = forwardRef<NameEntryScreenHandle, NameEntryScreenProps>(({ 
  onComplete,
  onSkip 
}, ref) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const t9Handler = useRef(new T9InputHandler());

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      t9Handler.current.cleanup();
    };
  }, []);

  const handleNumberPress = (key: string) => {
    // If in error state with retry option, clear error first
    if (canRetry) {
      setError(null);
      setCanRetry(false);
    }
    const newInput = t9Handler.current.handleKeyPress(key);
    setInput(newInput);
  };

  const handleBackspace = () => {
    // If in error state with retry option, clear error first
    if (canRetry) {
      setError(null);
      setCanRetry(false);
    }
    const newInput = t9Handler.current.handleBackspace();
    setInput(newInput);
  };

  /**
   * Submit display name to backend
   * Requirements: 11.1 - Send display name to backend on completion
   */
  const handleSubmit = async () => {
    // Validate locally first
    const validation = validateDisplayName(input);
    if (!validation.valid) {
      setError(validation.error || 'INVALID NAME');
      setCanRetry(false);
      return;
    }

    // Submit to backend via parent handler
    setIsProcessing(true);
    setError(null);
    setCanRetry(false);
    
    try {
      await onComplete(input);
      // Success - parent will handle navigation
    } catch (err) {
      // Requirements: 11.4 - Handle API errors with retry option
      console.error('Failed to save display name:', err);
      
      // Determine error message based on error type
      let errorMessage = 'SAVE FAILED';
      if (err instanceof Error) {
        if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'NETWORK ERROR';
        } else if (err.message === 'INVALID_NAME') {
          errorMessage = 'INVALID NAME';
        }
      }
      
      setError(errorMessage);
      setCanRetry(true);
      setIsProcessing(false);
    }
  };

  /**
   * Retry saving display name after error
   * Requirements: 11.4 - Allow retry on API error
   */
  const handleRetry = () => {
    if (canRetry) {
      handleSubmit();
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
    handleRetry,
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

  // Show error state with retry option
  if (error && canRetry) {
    return (
      <PagerScreen title="ENTER NAME">
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>ERROR:</PagerText>
        <PagerText style={{ textAlign: 'center' }}>{error}</PagerText>
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>NAME: {displayInput}</PagerText>
        <PagerText> </PagerText>
        <PagerText>CALL: RETRY</PagerText>
        <PagerText>BACK: SKIP</PagerText>
        <PagerText>0-9: EDIT NAME</PagerText>
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
