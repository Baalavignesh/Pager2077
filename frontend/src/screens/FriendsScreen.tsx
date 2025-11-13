import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface Friend {
  hexCode: string;
  status: string;
}

interface FriendsScreenProps {
  friends: Friend[];
  selectedIndex: number;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ friends, selectedIndex }) => {
  return (
    <PagerScreen title="FRIENDS">
      {friends.map((friend, index) => (
        <PagerText key={friend.hexCode} selected={index === selectedIndex}>
          {index === selectedIndex ? '>' : ' '} {friend.hexCode}
        </PagerText>
      ))}
    </PagerScreen>
  );
};
