import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

// Updated interface to match useFriendRequests hook output
// Requirements: 5.1, 5.2
interface FriendRequest {
  id: string;
  sixDigitCode: string;
  timestamp: string;
  displayName?: string;
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
            // Use displayName from request first, then fallback to displayNameMap, then hexCode
            // Requirements: 5.2 - Display requester's hex code or display name
            const displayName = request.displayName || displayNameMap[request.sixDigitCode] || request.sixDigitCode;
            return (
              <PagerText key={request.id} selected={index === selectedIndex}>
                {index === selectedIndex ? '>' : ' '} {displayName}
              </PagerText>
            );
          })}
        </>
      )}
    </PagerScreen>
  );
};
