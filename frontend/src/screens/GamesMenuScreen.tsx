import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface GamesMenuScreenProps {
  selectedIndex: number;
}

export const GamesMenuScreen: React.FC<GamesMenuScreenProps> = ({ selectedIndex }) => {
  const menuItems = [
    { id: 'snake', label: '1. SNAKE' },
    { id: 'leaderboard', label: '2. LEADERBOARD' },
  ];

  return (
    <PagerScreen title="GAMES">
      {menuItems.map((item, index) => (
        <PagerText key={item.id} selected={index === selectedIndex}>
          {index === selectedIndex ? '>' : ' '} {item.label}
        </PagerText>
      ))}
    </PagerScreen>
  );
};
