import React, { useState, useEffect } from 'react';
import { StatusBar, View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { retroTheme } from './src/theme';
import * as Font from 'expo-font';
import { PagerDisplay } from './src/components/PagerDisplay';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { FriendsListScreen } from './src/screens/FriendsListScreen';
import { AddFriendScreen } from './src/screens/AddFriendScreen';
import { FriendRequestsScreen } from './src/screens/FriendRequestsScreen';
import { MyHexScreen } from './src/screens/MyHexScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PagerBody } from './src/components/PagerBody';
import { BackgroundPattern } from './src/components/BackgroundPattern';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';

type Screen = 'main' | 'messages' | 'friends' | 'addFriend' | 'friendRequests' | 'myhex' | 'settings';

const mainMenu = [
  { id: 'messages', label: '1. MESSAGES', screen: 'messages' as Screen },
  { id: 'friends', label: '2. FRIENDS', screen: 'friends' as Screen },
  { id: 'myhex', label: '3. MY HEX', screen: 'myhex' as Screen },
  { id: 'settings', label: '4. SETTINGS', screen: 'settings' as Screen },
];

const mockFriends = [
  { hexCode: 'F1E2D3C4', status: 'ONLINE' as const },
  { hexCode: 'B5A6C7D8', status: 'OFFLINE' as const },
  { hexCode: '9C8D7E6F', status: 'ONLINE' as const },
];

const mockFriendRequests = [
  { hexCode: 'A1B2C3D4', timestamp: '2024-11-19T10:30:00' },
  { hexCode: 'E5F6G7H8', timestamp: '2024-11-19T09:15:00' },
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
  
  // Add friend state
  const [addFriendHexCode, setAddFriendHexCode] = useState('00000000');
  const [addFriendDigitIndex, setAddFriendDigitIndex] = useState(0);
  const [addFriendOption, setAddFriendOption] = useState(-1); // -1 = choosing method, 0 = paste selected, 1 = manual selected
  const [addFriendMethodIndex, setAddFriendMethodIndex] = useState(0); // 0 = paste, 1 = manual
  const [addFriendPasteError, setAddFriendPasteError] = useState(false);

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
          'FuturaCyrillicLight': require('./assets/fonts/FuturaCyrillicLight.ttf'),
          'FuturaCyrillicBook': require('./assets/fonts/FuturaCyrillicBook.ttf'),
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
  // TEMPORARILY DISABLED FOR UI DEVELOPMENT
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated && fontLoaded) {
  //     console.log('🔐 Not authenticated, registering...');
  //     register().catch((error) => {
  //       console.error('❌ Registration failed:', error);
  //     });
  //   }
  // }, [isLoading, isAuthenticated, fontLoaded]);

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
    // Special handling for Add Friend screen
    if (currentScreen === 'addFriend') {
      // If choosing input method, toggle between paste and manual
      if (addFriendOption === -1) {
        setAddFriendMethodIndex(addFriendMethodIndex === 0 ? 1 : 0);
        setAddFriendPasteError(false); // Clear error when switching
        return;
      }
      
      // Manual entry mode - change hex digit
      const hexChars = '0123456789ABCDEF'.split('');
      const currentChar = addFriendHexCode[addFriendDigitIndex];
      const currentIndex = hexChars.indexOf(currentChar);
      
      const newIndex = direction === 'up' 
        ? (currentIndex + 1) % hexChars.length
        : (currentIndex - 1 + hexChars.length) % hexChars.length;
      
      const newHexCode = addFriendHexCode.split('');
      newHexCode[addFriendDigitIndex] = hexChars[newIndex];
      setAddFriendHexCode(newHexCode.join(''));
      return;
    }
    
    let maxIndex = 0;
    
    if (currentScreen === 'main') {
      maxIndex = mainMenu.length - 1;
    } else if (currentScreen === 'friends') {
      // ADD FRIEND + REQUESTS (if any) + friends list
      const menuItems = 1 + (mockFriendRequests.length > 0 ? 1 : 0);
      maxIndex = menuItems + mockFriends.length - 1;
    } else if (currentScreen === 'friendRequests') {
      maxIndex = mockFriendRequests.length - 1;
    } else if (currentScreen === 'messages') {
      maxIndex = mockMessages.length - 1;
    }

    if (direction === 'up' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'down' && selectedIndex < maxIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleNavigateLeft = () => {
    // No-op for now - reserved for future horizontal navigation
    console.log('Navigate left (not yet implemented)');
  };

  const handleNavigateRight = () => {
    // No-op for now - reserved for future horizontal navigation
    console.log('Navigate right (not yet implemented)');
  };

  const handleSelect = () => {
    if (currentScreen === 'main') {
      const selected = mainMenu[selectedIndex];
      setCurrentScreen(selected.screen);
      setSelectedIndex(0);
    } else if (currentScreen === 'friends') {
      // Handle friends list selection
      const hasRequests = mockFriendRequests.length > 0;
      if (selectedIndex === 0) {
        // ADD FRIEND selected
        setCurrentScreen('addFriend');
        setAddFriendHexCode('00000000');
        setAddFriendDigitIndex(0);
        setAddFriendOption(-1); // Show method selection
        setAddFriendMethodIndex(0); // Default to paste
        setAddFriendPasteError(false);
      } else if (hasRequests && selectedIndex === 1) {
        // REQUESTS selected
        setCurrentScreen('friendRequests');
        setSelectedIndex(0);
      }
      // Individual friend selection can be handled later
    } else if (currentScreen === 'addFriend') {
      if (addFriendOption === -1) {
        // Choosing method - select the highlighted option
        if (addFriendMethodIndex === 0) {
          // Paste selected - try to paste
          handlePasteFromClipboard();
        } else {
          // Manual entry selected - switch to manual mode
          setAddFriendOption(1);
          setAddFriendHexCode('00000000');
          setAddFriendDigitIndex(0);
        }
      } else {
        // Manual entry mode - move to next digit or send request
        if (addFriendDigitIndex < 7) {
          setAddFriendDigitIndex(addFriendDigitIndex + 1);
        } else {
          // Send friend request
          handleSendFriendRequest(addFriendHexCode);
        }
      }
    } else if (currentScreen === 'friendRequests') {
      // Accept friend request
      const request = mockFriendRequests[selectedIndex];
      if (request) {
        handleAcceptRequest(request.hexCode);
      }
    }
  };

  const handleBack = () => {
    if (currentScreen === 'friendRequests') {
      // Reject friend request
      const request = mockFriendRequests[selectedIndex];
      if (request) {
        handleRejectRequest(request.hexCode);
      }
      return;
    }
    
    if (currentScreen === 'addFriend') {
      // In manual entry mode - move to previous digit
      if (addFriendOption === 0 && addFriendDigitIndex > 0) {
        setAddFriendDigitIndex(addFriendDigitIndex - 1);
      }
      // On paste screen - do nothing (use MENU to cancel)
    } else if (currentScreen !== 'main') {
      setCurrentScreen('main');
      setSelectedIndex(0);
    }
  };

  const handleMenu = () => {
    // Special handling for Add Friend screen - cancel and go back to friends
    if (currentScreen === 'addFriend') {
      setCurrentScreen('friends');
      setSelectedIndex(0);
      return;
    }
    
    // Otherwise go to main menu
    setCurrentScreen('main');
    setSelectedIndex(0);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const { default: Clipboard } = await import('expo-clipboard');
      const text = await Clipboard.getStringAsync();
      
      // Validate and clean hex code
      const cleanedHex = text.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().substring(0, 8);
      
      if (cleanedHex.length === 8) {
        setAddFriendHexCode(cleanedHex);
        setAddFriendDigitIndex(7); // Move to last digit
        setAddFriendOption(0); // Show pasted code
        setAddFriendPasteError(false);
        console.log('Pasted hex code:', cleanedHex);
      } else {
        console.log('Invalid hex code in clipboard');
        // Show error and stay on paste screen
        setAddFriendPasteError(true);
      }
    } catch (error) {
      console.log('Clipboard error:', error);
      // Show error and stay on paste screen
      setAddFriendPasteError(true);
    }
  };

  const handleSendFriendRequest = (hexCode: string) => {
    console.log('Sending friend request to:', hexCode);
    // TODO: Implement API call
    // Go back to friends list
    setCurrentScreen('friends');
    setSelectedIndex(0);
  };

  const handleAcceptRequest = (hexCode: string) => {
    console.log('Accepting friend request from:', hexCode);
    // TODO: Implement API call
  };

  const handleRejectRequest = (hexCode: string) => {
    console.log('Rejecting friend request from:', hexCode);
    // TODO: Implement API call
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenuScreen menuItems={mainMenu} selectedIndex={selectedIndex} />;
      case 'messages':
        return <MessagesScreen messages={mockMessages} selectedIndex={selectedIndex} />;
      case 'friends':
        return (
          <FriendsListScreen 
            friends={mockFriends} 
            selectedIndex={selectedIndex}
            pendingRequestsCount={mockFriendRequests.length}
          />
        );
      case 'addFriend':
        return (
          <AddFriendScreen 
            hexCode={addFriendHexCode}
            selectedDigit={addFriendDigitIndex}
            selectedOption={addFriendOption}
            methodIndex={addFriendMethodIndex}
            pasteError={addFriendPasteError}
          />
        );
      case 'friendRequests':
        return (
          <FriendRequestsScreen 
            requests={mockFriendRequests}
            selectedIndex={selectedIndex}
          />
        );
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
          onMenu={handleMenu}
          onNavigateLeft={handleNavigateLeft}
          onNavigateRight={handleNavigateRight}
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
    paddingBottom: 20,
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
