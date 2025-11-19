import React, { useState, useEffect } from 'react';
import { StatusBar, View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { retroTheme } from './src/theme';
import * as Font from 'expo-font';
import { PagerDisplay } from './src/components/PagerDisplay';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { MyHexScreen } from './src/screens/MyHexScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PagerBody } from './src/components/PagerBody';
import { BackgroundPattern } from './src/components/BackgroundPattern';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';

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

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const { isLoading, isAuthenticated, hexCode, register } = useAuth();

  // Set up notification handlers
  useNotifications({
    onNotificationReceived: (data) => {
      console.log('📬 Notification received:', data);
      // TODO: Handle different notification types
    },
    onNotificationTapped: (data) => {
      console.log('👆 Notification tapped:', data);
      // TODO: Navigate to appropriate screen
    },
  });

  useEffect(() => {
    async function loadFont() {
      try {
        await Font.loadAsync({
          'Chicago': require('./assets/pixChicago.ttf'),
        });
        setFontLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontLoaded(true);
      }
    }
    loadFont();
  }, []);

  // Auto-register if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && fontLoaded) {
      console.log('🔐 Not authenticated, registering...');
      register().catch((error) => {
        console.error('❌ Registration failed:', error);
      });
    }
  }, [isLoading, isAuthenticated, fontLoaded]);

  // Show loading screen while initializing
  if (!fontLoaded || isLoading) {
    return (
      <NativeBaseProvider theme={retroTheme}>
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
          style={[styles.container, styles.centered]}
        >
          <ActivityIndicator size="large" color="#C7D3C0" />
          <Text style={styles.loadingText}>INITIALIZING...</Text>
        </LinearGradient>
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
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar hidden />
        
        {/* Subtle dot pattern for tech aesthetic */}
        <BackgroundPattern />

        <PagerDisplay>
          {renderScreen()}
        </PagerDisplay>

        <PagerBody
          onSelect={handleSelect}
          onBack={handleBack}
          onNavigateUp={() => navigate('up')}
          onNavigateDown={() => navigate('down')}
        />
      </LinearGradient>
    </NativeBaseProvider>
  );
}

export default function App() {
  return (
    <NativeBaseProvider theme={retroTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Chicago',
    fontSize: 14,
    color: '#C7D3C0',
    marginTop: 16,
    letterSpacing: 2,
  },
});
