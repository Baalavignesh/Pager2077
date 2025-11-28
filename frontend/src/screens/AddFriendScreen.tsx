import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface AddFriendScreenProps {
  digitInput: string;
  error?: string;
  isProcessing?: boolean;
}

export const AddFriendScreen: React.FC<AddFriendScreenProps> = ({ 
  digitInput,
  error,
  isProcessing = false
}) => {
  // Format the input with underscores for empty digits
  const formattedInput = digitInput.padEnd(6, '_');
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
      <PagerText>ENTER 6-DIGIT CODE:</PagerText>
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
      
      <PagerText>CALL BUTTON: SEND</PagerText>
      <PagerText>Backspace - #</PagerText>
    </PagerScreen>
  );
};
