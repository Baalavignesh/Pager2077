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
}

export const EditNameScreen = forwardRef<EditNameScreenHandle, EditNameScreenProps>(({ 
  currentDisplayName,
  onSave,
  onCancel
}, ref) => {
  const [input, setInput] = useState(currentDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      await onSave(input);
    } catch (err) {
      setError('FAILED TO SAVE NAME');
      setIsProcessing(false);
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
