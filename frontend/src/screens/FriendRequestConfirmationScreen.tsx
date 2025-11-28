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
  displayNameMap?: Record<string, string>;
}

export const FriendRequestConfirmationScreen: React.FC<FriendRequestConfirmationScreenProps> = ({ 
  request, 
  focusedButton,
  isProcessing = false,
  displayNameMap = {}
}) => {
  const displayName = displayNameMap[request.sixDigitCode] || request.sixDigitCode;
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
      <PagerText>FROM: {displayName}</PagerText>
      <PagerText>─────────────</PagerText>
      <PagerText> </PagerText>
      <PagerText>ACCEPT THIS REQUEST?</PagerText>
      <PagerText> </PagerText>
      <PagerText selected={focusedButton === 'no'}>
        {focusedButton === 'no' ? '  NO' : '  NO'}
      </PagerText>
      <PagerText selected={focusedButton === 'yes'}>
        {focusedButton === 'yes' ? '  YES' : '  YES'}
      </PagerText>
    </PagerScreen>
  );
};
