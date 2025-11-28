import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface Friend {
  sixDigitCode: string;
  status: 'ONLINE' | 'OFFLINE';
}

interface FriendsListScreenProps {
  friends: Friend[];
  selectedIndex: number;
  pendingRequestsCount: number;
}

export const FriendsListScreen: React.FC<FriendsListScreenProps> = ({ 
  friends, 
  selectedIndex,
  pendingRequestsCount 
}) => {
  // Menu items: ADD FRIEND, REQUESTS (if any), then friends list
  const menuItems = [
    { id: 'add', label: '+ ADD FRIEND' },
    ...(pendingRequestsCount > 0 ? [{ id: 'requests', label: `* REQUESTS (${pendingRequestsCount})` }] : []),
  ];

  const totalMenuItems = menuItems.length;

  return (
    <PagerScreen title="FRIENDS">
      {/* Menu items */}
      {menuItems.map((item, index) => (
        <PagerText key={item.id} selected={index === selectedIndex}>
          {index === selectedIndex ? '>' : ' '} {item.label}
        </PagerText>
      ))}

      {/* Divider if there are friends */}
      {/* {friends.length > 0 && <PagerText>─────────────</PagerText>} */}

      {/* Friends list */}
      {friends.map((friend, index) => {
        const itemIndex = totalMenuItems + index;
        // const statusDot = friend.status === 'ONLINE' ? '●' : '○';
        return (
          <PagerText key={friend.sixDigitCode} selected={itemIndex === selectedIndex}>
            {itemIndex === selectedIndex ? '>' : ' '} {friend.sixDigitCode}
          </PagerText>
        );
      })}

      {/* Empty state */}
      {friends.length === 0 && (
        <PagerText>
          NO FRIENDS YET
        </PagerText>
      )}
    </PagerScreen>
  );
};
