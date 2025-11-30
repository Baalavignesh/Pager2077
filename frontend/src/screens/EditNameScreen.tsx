/**
 * Edit Name Screen - Update display name from settings
 * Requirements: 12.1, 12.2, 12.3 - Call backend API to update display name
 *                                 Update local state on success
 */
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';
import { T9InputHandler } from '../utils/t9Input';
import { validateDisplayName } from '../services/displayNameService';

interface EditNameScreenProps {
  currentDisplayName: string;
  onSave: (newDisplayName: string) => void;
  onCancel: () => void;
}

export interface EditNameScreenHandle {
  handleNumberPress: (key: string) => void;
  handleBackspace: () => void;
  handleSubmit: () => void;
  handleRetry: () => void;
}

export const EditNameScreen = forwardRef<EditNameScreenHandle, EditNameScreenProps>(({ 
  currentDisplayName,
  onSave,
  onCancel
}, ref) => {
  const [input, setInput] = useState(currentDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const t9Handler = useRef(new T9InputHandler());

  useEffect(() => {
    // Pre-fill with current name
    t9Handler.current.setInput(currentDisplayName);
    
    // Cleanup on unmount
    return () => {
      t9Handler.current.cleanup();
    };
  }, [currentDisplayName]);

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
   * Submit updated display name to backend
   * Requirements: 12.1 - Send updated display name to backend
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
      // Requirements: 12.2, 12.3 - Backend updates and local state update handled by parent
      await onSave(input);
      // Success - parent will handle navigation and state update
    } catch (err) {
      console.error('Failed to update display name:', err);
      
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
   */
  const handleRetry = () => {
    if (canRetry) {
      handleSubmit();
    }
  };

  const handleCancelPress = () => {
    onCancel();
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    handleNumberPress,
    handleBackspace,
    handleSubmit,
    handleRetry,
  }));

  // Format input for display
  const displayInput = input || '_';

  if (isProcessing) {
    return (
      <PagerScreen title="EDIT NAME">
        <PagerText> </PagerText>
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>SAVING...</PagerText>
      </PagerScreen>
    );
  }

  // Show error state with retry option
  if (error && canRetry) {
    return (
      <PagerScreen title="EDIT NAME">
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>ERROR:</PagerText>
        <PagerText style={{ textAlign: 'center' }}>{error}</PagerText>
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>NAME: {displayInput}</PagerText>
        <PagerText> </PagerText>
        <PagerText>CALL: RETRY</PagerText>
        <PagerText>BACK: CANCEL</PagerText>
        <PagerText>0-9: EDIT NAME</PagerText>
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="EDIT NAME">
      <PagerText>EDIT YOUR NAME:</PagerText>
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
      <PagerText>BACK: CANCEL</PagerText>
    </PagerScreen>
  );
});

const styles = StyleSheet.create({
  spacer: {
    height: 8,
  },
});
