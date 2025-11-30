import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface SettingsScreenProps {
  selectedIndex: number;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  currentView: 'main' | 'about' | 'help' | 'editName';
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  selectedIndex,
  soundEnabled,
  vibrateEnabled,
  currentView,
}) => {
  if (currentView === 'about') {
    return (
      <PagerScreen title="ABOUT">
        <PagerText>PAGER2077</PagerText>
        <View style={styles.spacer} />
        <PagerText>A RETRO-FUTURISTIC</PagerText>
        <PagerText>MESSAGING APP</PagerText>
        <PagerText>WITH A 90S PAGER</PagerText>
        <PagerText>AESTHETIC.</PagerText>
        <View style={styles.spacer} />
        
        <PagerText>PRESS BACK TO</PagerText>
        <PagerText>RETURN</PagerText>
      </PagerScreen>
    );
  }

  if (currentView === 'help') {
    return (
      <PagerScreen title="HELP">
        <PagerText>CONTROLS:</PagerText>
        <View style={styles.spacer} />
        <PagerText>* - HOME SCREEN</PagerText>
        <PagerText>5 - SELECT BUTTON</PagerText>
        <PagerText>2 - UP</PagerText>
        <PagerText>8 - DOWN</PagerText>
        <View style={styles.spacer} />
        <PagerText>CALL ICON - ACCEPT</PagerText>
        <PagerText>BACK ICON - BACK</PagerText>
        <View style={styles.spacer} />
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="SETTINGS">
      <PagerText selected={selectedIndex === 0}>
        {selectedIndex === 0 ? '>' : ' '} SOUND: {soundEnabled ? 'ON' : 'OFF'}
      </PagerText>
      <PagerText selected={selectedIndex === 1}>
        {selectedIndex === 1 ? '>' : ' '} VIBRATE: {vibrateEnabled ? 'ON' : 'OFF'}
      </PagerText>
      <PagerText selected={selectedIndex === 2}>
        {selectedIndex === 2 ? '>' : ' '} EDIT NAME
      </PagerText>
      <PagerText selected={selectedIndex === 3}>
        {selectedIndex === 3 ? '>' : ' '} ABOUT
      </PagerText>
      <PagerText selected={selectedIndex === 4}>
        {selectedIndex === 4 ? '>' : ' '} HELP
      </PagerText>
      <PagerText selected={selectedIndex === 5}>
        {selectedIndex === 5 ? '>' : ' '} LOGOUT
      </PagerText>
    </PagerScreen>
  );
};

const styles = StyleSheet.create({
  spacer: {
    height: 8,
  },
});
