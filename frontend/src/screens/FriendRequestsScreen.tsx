import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface FriendRequest {
  sixDigitCode: string;
  timestamp: string;
}

interface FriendRequestsScreenProps {
  requests: FriendRequest[];
  selectedIndex: number;
  displayNameMap?: Record<string, string>;
}

export const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ 
  requests, 
  selectedIndex,
  displayNameMap = {}
}) => {
  return (
    <PagerScreen title="FRIEND REQUESTS">
      {requests.length === 0 ? (
        <PagerText>NO PENDING REQUESTS</PagerText>
      ) : (
        <>
          <PagerText>SELECT: VIEW</PagerText>
          <PagerText>─────────────</PagerText>
          
          {requests.map((request, index) => {
            const displayName = displayNameMap[request.sixDigitCode] || request.sixDigitCode;
            return (
              <PagerText key={request.sixDigitCode} selected={index === selectedIndex}>
                {index === selectedIndex ? '>' : ' '} {displayName}
              </PagerText>
            );
          })}
        </>
      )}
    </PagerScreen>
  );
};
