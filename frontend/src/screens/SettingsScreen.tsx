import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

export const SettingsScreen: React.FC = () => {
  return (
    <PagerScreen title="SETTINGS">
      <PagerText>1. SOUND: ON</PagerText>
      <PagerText>2. VIBRATE: ON</PagerText>
      <PagerText>3. ABOUT</PagerText>
    </PagerScreen>
  );
};
