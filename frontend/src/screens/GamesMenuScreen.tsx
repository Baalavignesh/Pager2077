import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface GamesMenuScreenProps {
  selectedIndex: number;
  currentGame?: 'snake' | null;
}

export const GamesMenuScreen: React.FC<GamesMenuScreenProps> = ({ selectedIndex, currentGame }) => {
  // If a game is selected, show play/leaderboard options
  if (currentGame) {
    const menuItems = [
      { id: 'play', label: '1. PLAY' },
      { id: 'leaderboard', label: '2. LEADERBOARD' },
    ];

    return (
      <PagerScreen title="SNAKE">
        {menuItems.map((item, index) => (
          <PagerText key={item.id} selected={index === selectedIndex}>
            {index === selectedIndex ? '>' : ' '} {item.label}
          </PagerText>
        ))}
      </PagerScreen>
    );
  }

  // Main games list (only Snake for now)
  const menuItems = [
    { id: 'snake', label: '1. SNAKE' },
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
