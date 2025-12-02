import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface GamesMenuScreenProps {
  selectedIndex: number;
  currentGame?: 'snake' | 'tetris' | null;
}

export const GamesMenuScreen: React.FC<GamesMenuScreenProps> = ({ selectedIndex, currentGame }) => {
  // If a game is selected, show play/leaderboard options
  if (currentGame) {
    const menuItems = [
      { id: 'play', label: '1. PLAY' },
      { id: 'leaderboard', label: '2. LEADERBOARD' },
    ];

    // Get title based on current game
    const gameTitle = currentGame === 'snake' ? 'SNAKE' : 'TETRIS';

    return (
      <PagerScreen title={gameTitle}>
        {menuItems.map((item, index) => (
          <PagerText key={item.id} selected={index === selectedIndex}>
            {index === selectedIndex ? '>' : ' '} {item.label}
          </PagerText>
        ))}
      </PagerScreen>
    );
  }

  // Main games list - Snake and Tetris
  // Requirements: 7.1 - Tetris appears as selectable option alongside Snake
  const menuItems = [
    { id: 'snake', label: '1. SNAKE' },
    { id: 'tetris', label: '2. TETRIS' },
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
