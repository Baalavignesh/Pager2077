import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface AddFriendScreenProps {
  hexInput: string;
  error?: string;
  isProcessing?: boolean;
}

export const AddFriendScreen: React.FC<AddFriendScreenProps> = ({ 
  hexInput,
  error,
  isProcessing = false
}) => {
  // Format the input with underscores for empty characters (8-char hex code)
  const formattedInput = hexInput.toUpperCase().padEnd(8, '_');
  const displayInput = formattedInput.split('').join(' ');

  if (isProcessing) {
    return (
      <PagerScreen title="ADD FRIEND">
        <PagerText> </PagerText>
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>SENDING...</PagerText>
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="ADD FRIEND">
      <PagerText>ENTER HEX CODE:</PagerText>
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
      
      <PagerText>PRESS KEY MULTIPLE</PagerText>
      <PagerText>TIMES FOR LETTERS</PagerText>
      <PagerText> </PagerText>
      <PagerText>#: BACKSPACE</PagerText>
      <PagerText>CALL: {hexInput.length === 0 ? 'PASTE' : hexInput.length === 8 ? 'SEND' : '---'}</PagerText>
    </PagerScreen>
  );
};
