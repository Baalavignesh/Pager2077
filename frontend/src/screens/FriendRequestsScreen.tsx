import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface FriendRequest {
  hexCode: string;
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
          <PagerText>SELECT: ACCEPT</PagerText>
          <PagerText>BACK: REJECT</PagerText>
          <PagerText>─────────────</PagerText>
          
          {requests.map((request, index) => (
            <PagerText key={request.hexCode} selected={index === selectedIndex}>
              {index === selectedIndex ? '>' : ' '} {request.hexCode}
            </PagerText>
          ))}
        </>
      )}
    </PagerScreen>
  );
};
