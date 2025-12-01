import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

// Updated interface to match useFriendRequests hook output
// Requirements: 5.3, 5.4
interface FriendRequest {
  id: string;
  sixDigitCode: string;
  timestamp: string;
  displayName?: string;
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
  // Use displayName from request first, then fallback to displayNameMap, then hexCode
  const displayName = request.displayName || displayNameMap[request.sixDigitCode] || request.sixDigitCode;
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
