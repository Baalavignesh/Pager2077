import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface MenuItem {
  id: string;
  label: string;
}

interface MainMenuScreenProps {
  menuItems: MenuItem[];
  selectedIndex: number;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ menuItems, selectedIndex }) => {
  return (
    <PagerScreen title="PAGER 2077">
      {menuItems.map((item, index) => (
        <PagerText key={item.id} selected={index === selectedIndex}>
          {index === selectedIndex ? '>' : ' '} {item.label}
        </PagerText>
      ))}
    </PagerScreen>
  );
};
