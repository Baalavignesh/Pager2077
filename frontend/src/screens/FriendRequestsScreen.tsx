import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface FriendRequest {
  sixDigitCode: string;
  timestamp: string;
}

interface FriendRequestsScreenProps {
  requests: FriendRequest[];
  selectedIndex: number;
}

export const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ 
  requests, 
  selectedIndex 
}) => {
  return (
    <PagerScreen title="FRIEND REQUESTS">
      {requests.length === 0 ? (
        <PagerText>NO PENDING REQUESTS</PagerText>
      ) : (
        <>
          <PagerText>SELECT: VIEW</PagerText>
          <PagerText>─────────────</PagerText>
          
          {requests.map((request, index) => (
            <PagerText key={request.sixDigitCode} selected={index === selectedIndex}>
              {index === selectedIndex ? '>' : ' '} {request.sixDigitCode}
            </PagerText>
          ))}
        </>
      )}
    </PagerScreen>
  );
};
