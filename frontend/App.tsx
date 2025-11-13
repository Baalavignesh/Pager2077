import React, { useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { retroTheme } from './src/theme';
import * as Font from 'expo-font';
import { PagerDisplay } from './src/components/PagerDisplay';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { MyHexScreen } from './src/screens/MyHexScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PagerBody } from './src/components/PagerBody';

type Screen = 'main' | 'messages' | 'friends' | 'myhex' | 'settings';

const mainMenu = [
  { id: 'messages', label: '1. MESSAGES', screen: 'messages' as Screen },
  { id: 'friends', label: '2. FRIENDS', screen: 'friends' as Screen },
  { id: 'myhex', label: '3. MY HEX', screen: 'myhex' as Screen },
  { id: 'settings', label: '4. SETTINGS', screen: 'settings' as Screen },
];

const mockFriends = [
  { hexCode: 'F1E2D3C4', status: 'ONLINE' },
  { hexCode: 'B5A6C7D8', status: 'OFFLINE' },
  { hexCode: '9C8D7E6F', status: 'ONLINE' },
];

const mockMessages = [
  { from: 'F1E2D3C4', text: 'HELLO THERE!', time: '14:30' },
  { from: 'B5A6C7D8', text: 'HOW ARE YOU?', time: '12:15' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);

  React.useEffect(() => {
    async function loadFont() {
      try {
        await Font.loadAsync({
          'MyPager': require('./assets/MyPager.ttf'),
        });
        setFontLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontLoaded(true);
      }
    }
    loadFont();
  }, []);

  if (!fontLoaded) {
    return (
      <NativeBaseProvider theme={retroTheme}>
        <View style={styles.container} />
      </NativeBaseProvider>
    );
  }

  const navigate = (direction: 'up' | 'down') => {
    const maxIndex = currentScreen === 'main' ? mainMenu.length - 1 :
      currentScreen === 'friends' ? mockFriends.length - 1 :
        currentScreen === 'messages' ? mockMessages.length - 1 : 0;

    if (direction === 'up' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'down' && selectedIndex < maxIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSelect = () => {
    if (currentScreen === 'main') {
      const selected = mainMenu[selectedIndex];
      setCurrentScreen(selected.screen);
      setSelectedIndex(0);
    }
  };

  const handleBack = () => {
    if (currentScreen !== 'main') {
      setCurrentScreen('main');
      setSelectedIndex(0);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenuScreen menuItems={mainMenu} selectedIndex={selectedIndex} />;
      case 'messages':
        return <MessagesScreen messages={mockMessages} selectedIndex={selectedIndex} />;
      case 'friends':
        return <FriendsScreen friends={mockFriends} selectedIndex={selectedIndex} />;
      case 'myhex':
        return <MyHexScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <NativeBaseProvider theme={retroTheme}>
      <View style={styles.container}>
        <StatusBar hidden />

        <PagerDisplay>
          {renderScreen()}
        </PagerDisplay>

        <PagerBody
          onSelect={handleSelect}
          onBack={handleBack}
          onNavigateUp={() => navigate('up')}
          onNavigateDown={() => navigate('down')}
        />
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    justifyContent: 'space-between',
    borderWidth: 4,
    borderTopColor: '#4A4A4A',
    borderLeftColor: '#4A4A4A',
    borderRightColor: '#1A1A1A',
    borderBottomColor: '#1A1A1A',
  },
});
