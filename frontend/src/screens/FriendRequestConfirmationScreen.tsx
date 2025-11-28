import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface FriendRequest {
  sixDigitCode: string;
  timestamp: string;
}

interface FriendRequestConfirmationScreenProps {
  request: FriendRequest;
  focusedButton: 'yes' | 'no' | null;
  isProcessing?: boolean;
}

export const FriendRequestConfirmationScreen: React.FC<FriendRequestConfirmationScreenProps> = ({ 
  request, 
  focusedButton,
  isProcessing = false
}) => {
  if (isProcessing) {
    return (
      <PagerScreen title="CONFIRM REQUEST">
        <PagerText> </PagerText>
        <PagerText> </PagerText>
        <PagerText style={{ textAlign: 'center' }}>PROCESSING...</PagerText>
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="CONFIRM REQUEST">
      <PagerText>─────────────</PagerText>
      <PagerText>FROM: {request.sixDigitCode}</PagerText>
      <PagerText> </PagerText>
      <PagerText>ACCEPT THIS REQUEST?</PagerText>
      <PagerText> </PagerText>
      <PagerText selected={focusedButton === 'no'}>
        {focusedButton === 'no' ? '◄ NO' : '  NO'}
      </PagerText>
      <PagerText selected={focusedButton === 'yes'}>
        {focusedButton === 'yes' ? 'YES ►' : 'YES  '}
      </PagerText>
    </PagerScreen>
  );
};
