import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
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
import { FriendRequestConfirmationScreen } from './src/screens/FriendRequestConfirmationScreen';
import { MyHexScreen } from './src/screens/MyHexScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NameEntryScreen, NameEntryScreenHandle } from './src/screens/NameEntryScreen';
import { EditNameScreen, EditNameScreenHandle } from './src/screens/EditNameScreen';
import { PagerBody } from './src/components/PagerBody';
import { ChatPagerBody } from './src/components/ChatPagerBody';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import { hasDisplayName, getAllDisplayNameMappings } from './src/services/storageService';
import { setCurrentUserDisplayName } from './src/services/displayNameService';

type Screen = 'main' | 'messages' | 'friends' | 'addFriend' | 'friendRequests' | 'friendRequestConfirmation' | 'myhex' | 'settings' | 'editName';

const mainMenu = [
  { id: 'messages', label: '1. MESSAGES', screen: 'messages' as Screen },
  { id: 'friends', label: '2. FRIENDS', screen: 'friends' as Screen },
  { id: 'myhex', label: '3. MY HEX', screen: 'myhex' as Screen },
  { id: 'settings', label: '4. SETTINGS', screen: 'settings' as Screen },
];

const mockFriends = [
  { sixDigitCode: '123456', status: 'ONLINE' as const },
  { sixDigitCode: '789012', status: 'OFFLINE' as const },
  { sixDigitCode: '345678', status: 'ONLINE' as const },
];

const mockFriendRequests = [
  { sixDigitCode: '111222', timestamp: '2024-11-19T10:30:00' },
  { sixDigitCode: '333444', timestamp: '2024-11-19T09:15:00' },
];

const mockMessages = [
  { from: 'F1E2D3C4', text: 'HELLO THERE!', time: '14:30' },
  { from: 'B5A6C7D8', text: 'HOW ARE YOU?', time: '12:15' },
];

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const { isLoading, isAuthenticated, hexCode } = useAuth();
  
  // Display name state
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [displayNameMap, setDisplayNameMap] = useState<Record<string, string>>({});
  const nameEntryRef = useRef<NameEntryScreenHandle>(null);
  const editNameRef = useRef<EditNameScreenHandle>(null);
  
  // Add friend state
  const [friendRequestInput, setFriendRequestInput] = useState('');
  const [friendRequestError, setFriendRequestError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Friend request confirmation state
  const [confirmingRequest, setConfirmingRequest] = useState<{ sixDigitCode: string; timestamp: string } | null>(null);
  const [confirmationFocusedButton, setConfirmationFocusedButton] = useState<'yes' | 'no' | null>(null);

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [settingsView, setSettingsView] = useState<'main' | 'about' | 'help' | 'editName'>('main');
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('');

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

  // Check for display name on authentication (or in dev mode)
  useEffect(() => {
    async function checkDisplayName() {
      // In development mode (no auth), use a mock hex code for testing
      const effectiveHexCode = hexCode || 'ABC123';
      
      if (fontLoaded && (isAuthenticated || !hexCode)) {
        const hasName = await hasDisplayName();
        setNeedsDisplayName(!hasName);
        
        // Load display name mappings
        const mappings = await getAllDisplayNameMappings();
        setDisplayNameMap(mappings);
        
        // Load current user's display name
        const { getCurrentUserDisplayName } = await import('./src/services/displayNameService');
        const name = await getCurrentUserDisplayName();
        setCurrentDisplayName(name || effectiveHexCode);
      }
    }
    checkDisplayName();
  }, [isAuthenticated, hexCode, fontLoaded]);

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

  // Handle display name set
  const handleDisplayNameSet = async (displayName: string) => {
    try {
      // Use mock hex code in dev mode if not authenticated
      const effectiveHexCode = hexCode || 'ABC123';
      
      await setCurrentUserDisplayName(effectiveHexCode, displayName);
      setNeedsDisplayName(false);
      
      // Reload mappings
      const mappings = await getAllDisplayNameMappings();
      setDisplayNameMap(mappings);
    } catch (error) {
      console.error('Failed to set display name:', error);
      // Show error to user
      alert('Failed to save name. Please try again.');
    }
  };

  const handleSkipDisplayName = async () => {
    try {
      // Use mock hex code in dev mode if not authenticated
      const effectiveHexCode = hexCode || 'ABC123';
      
      // Use hex code as default display name
      await setCurrentUserDisplayName(effectiveHexCode, effectiveHexCode);
      setNeedsDisplayName(false);
      
      // Reload mappings
      const mappings = await getAllDisplayNameMappings();
      setDisplayNameMap(mappings);
    } catch (error) {
      console.error('Failed to set default name:', error);
    }
  };

  const handleEditDisplayName = async (newDisplayName: string) => {
    try {
      // Use mock hex code in dev mode if not authenticated
      const effectiveHexCode = hexCode || 'ABC123';
      
      await setCurrentUserDisplayName(effectiveHexCode, newDisplayName);
      setCurrentDisplayName(newDisplayName);
      
      // Reload mappings
      const mappings = await getAllDisplayNameMappings();
      setDisplayNameMap(mappings);
      
      // Return to settings main
      setSettingsView('main');
    } catch (error) {
      console.error('Failed to update display name:', error);
      alert('Failed to save name. Please try again.');
    }
  };

  const handleCancelEditName = () => {
    setSettingsView('main');
  };

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

  // Show name entry screen if needed
  if (needsDisplayName) {
    return (
      <NativeBaseProvider theme={retroTheme}>
        <LinearGradient
          colors={['#d4d4d4', '#a8a8a8', '#c0c0c0', '#909090', '#b8b8b8', '#888888', '#a0a0a0']}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.15, 0.3, 0.5, 0.65, 0.8, 1]}
        >
          <PagerDisplay>
            <NameEntryScreen 
              ref={nameEntryRef}
              onComplete={handleDisplayNameSet}
              onSkip={handleSkipDisplayName}
            />
          </PagerDisplay>

          <ChatPagerBody
            onConfirm={() => nameEntryRef.current?.handleSubmit()}
            onBack={handleSkipDisplayName}
            onMenu={() => {}}
            onNumberPress={(key) => {
              if (key === '#') {
                nameEntryRef.current?.handleBackspace();
              } else if (key >= '0' && key <= '9') {
                nameEntryRef.current?.handleNumberPress(key);
              }
            }}
            onCall={() => nameEntryRef.current?.handleSubmit()}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        </LinearGradient>
      </NativeBaseProvider>
    );
  }

  const navigate = (direction: 'up' | 'down') => {
    // On Add Friend screen, up/down keys should enter numbers, not navigate
    if (currentScreen === 'addFriend') {
      // Handle as number input instead
      if (direction === 'up') {
        handleNumberPress('2');
      } else if (direction === 'down') {
        handleNumberPress('8');
      }
      return;
    }
    
    // On confirmation screen, up/down toggles between yes and no
    if (currentScreen === 'friendRequestConfirmation') {
      if (confirmationFocusedButton === 'yes') {
        setConfirmationFocusedButton('no');
      } else {
        setConfirmationFocusedButton('yes');
      }
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
    } else if (currentScreen === 'settings') {
      maxIndex = 4; // Sound, Vibrate, Edit Name, About, Help
    }

    if (direction === 'up' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'down' && selectedIndex < maxIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleNavigateLeft = () => {
    // On Add Friend screen, key 4 should enter number
    if (currentScreen === 'addFriend') {
      handleNumberPress('4');
      return;
    }
    
    // On confirmation screen, focus "NO"
    if (currentScreen === 'friendRequestConfirmation') {
      setConfirmationFocusedButton('no');
      return;
    }
    
    // No-op for other screens
    console.log('Navigate left (not yet implemented)');
  };

  const handleNavigateRight = () => {
    // On Add Friend screen, key 6 should enter number
    if (currentScreen === 'addFriend') {
      handleNumberPress('6');
      return;
    }
    
    // On confirmation screen, focus "YES"
    if (currentScreen === 'friendRequestConfirmation') {
      setConfirmationFocusedButton('yes');
      return;
    }
    
    // No-op for other screens
    console.log('Navigate right (not yet implemented)');
  };

  const handleSelect = () => {
    // On Add Friend screen, key 5 should enter number
    if (currentScreen === 'addFriend') {
      handleNumberPress('5');
      return;
    }
    
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
        setFriendRequestInput('');
        setFriendRequestError('');
      } else if (hasRequests && selectedIndex === 1) {
        // REQUESTS selected
        setCurrentScreen('friendRequests');
        setSelectedIndex(0);
      }
      // Individual friend selection can be handled later
    } else if (currentScreen === 'friendRequests') {
      // Navigate to confirmation screen
      const request = mockFriendRequests[selectedIndex];
      if (request) {
        setConfirmingRequest(request);
        setConfirmationFocusedButton('yes'); // Default to yes
        setCurrentScreen('friendRequestConfirmation');
      }
    } else if (currentScreen === 'friendRequestConfirmation') {
      // Execute accept or reject based on focused button
      if (confirmingRequest && confirmationFocusedButton) {
        if (confirmationFocusedButton === 'yes') {
          handleAcceptRequest(confirmingRequest.sixDigitCode);
        } else {
          handleRejectRequest(confirmingRequest.sixDigitCode);
        }
      }
    } else if (currentScreen === 'settings') {
      // Handle settings menu selection
      switch (selectedIndex) {
        case 0: // Sound
          setSoundEnabled(!soundEnabled);
          break;
        case 1: // Vibrate
          setVibrateEnabled(!vibrateEnabled);
          break;
        case 2: // Edit Name
          setSettingsView('editName');
          break;
        case 3: // About
          setSettingsView('about');
          break;
        case 4: // Help
          setSettingsView('help');
          break;
      }
    }
  };

  const handleBack = () => {
    if (currentScreen === 'friendRequestConfirmation') {
      // Return to friend requests screen without action
      setCurrentScreen('friendRequests');
      setConfirmingRequest(null);
      setConfirmationFocusedButton(null);
      return;
    }
    
    if (currentScreen === 'addFriend') {
      // Clear input and return to friends screen
      setFriendRequestInput('');
      setFriendRequestError('');
      setCurrentScreen('friends');
      setSelectedIndex(0);
      return;
    }
    
    if (currentScreen === 'settings' && settingsView !== 'main') {
      // Return to settings main menu from About, Help, or Edit Name
      setSettingsView('main');
      return;
    }
    
    if (currentScreen !== 'main') {
      setCurrentScreen('main');
      setSelectedIndex(0);
      // Reset settings view when leaving settings
      if (currentScreen === 'settings') {
        setSettingsView('main');
      }
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

  const handleNumberPress = (number: string) => {
    // Handle number presses on Add Friend screen
    if (currentScreen === 'addFriend') {
      if (number === '#') {
        // Backspace - remove last digit
        if (friendRequestInput.length > 0) {
          setFriendRequestInput(friendRequestInput.slice(0, -1));
        }
      } else if (number >= '0' && number <= '9') {
        // Append digit if less than 6 digits
        if (friendRequestInput.length < 6) {
          setFriendRequestInput(friendRequestInput + number);
        }
      }
    }
    
    // Handle number presses on Edit Name screen
    if (currentScreen === 'settings' && settingsView === 'editName') {
      if (number === '#') {
        editNameRef.current?.handleBackspace();
      } else if (number >= '0' && number <= '9') {
        editNameRef.current?.handleNumberPress(number);
      }
    }
  };

  const handleCall = () => {
    // On Add Friend screen, call button sends the friend request
    if (currentScreen === 'addFriend' && friendRequestInput.length === 6) {
      handleSendFriendRequest(friendRequestInput);
    }
    
    // On Edit Name screen, call button saves the name
    if (currentScreen === 'settings' && settingsView === 'editName') {
      editNameRef.current?.handleSubmit();
    }
  };

  const handleSendFriendRequest = async (sixDigitCode: string) => {
    console.log('Sending friend request to:', sixDigitCode);
    setIsProcessing(true);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Implement actual API call
    // For now, just clear and navigate
    setIsProcessing(false);
    setFriendRequestInput('');
    setFriendRequestError('');
    setCurrentScreen('friends');
    setSelectedIndex(0);
  };

  const handleAcceptRequest = async (sixDigitCode: string) => {
    console.log('Accepting friend request from:', sixDigitCode);
    setIsProcessing(true);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Implement actual API call
    setIsProcessing(false);
    setCurrentScreen('friendRequests');
    setConfirmingRequest(null);
    setConfirmationFocusedButton(null);
    setSelectedIndex(0);
  };

  const handleRejectRequest = async (sixDigitCode: string) => {
    console.log('Rejecting friend request from:', sixDigitCode);
    setIsProcessing(true);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Implement actual API call
    setIsProcessing(false);
    setCurrentScreen('friendRequests');
    setConfirmingRequest(null);
    setConfirmationFocusedButton(null);
    setSelectedIndex(0);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenuScreen menuItems={mainMenu} selectedIndex={selectedIndex} />;
      case 'messages':
        return <MessagesScreen messages={mockMessages} selectedIndex={selectedIndex} displayNameMap={displayNameMap} />;
      case 'friends':
        return (
          <FriendsListScreen 
            friends={mockFriends} 
            selectedIndex={selectedIndex}
            pendingRequestsCount={mockFriendRequests.length}
            displayNameMap={displayNameMap}
          />
        );
      case 'addFriend':
        return (
          <AddFriendScreen 
            digitInput={friendRequestInput}
            error={friendRequestError}
            isProcessing={isProcessing}
          />
        );
      case 'friendRequests':
        return (
          <FriendRequestsScreen 
            requests={mockFriendRequests}
            selectedIndex={selectedIndex}
            displayNameMap={displayNameMap}
          />
        );
      case 'friendRequestConfirmation':
        return confirmingRequest ? (
          <FriendRequestConfirmationScreen 
            request={confirmingRequest}
            focusedButton={confirmationFocusedButton}
            isProcessing={isProcessing}
            displayNameMap={displayNameMap}
          />
        ) : null;
      case 'myhex':
        return <MyHexScreen />;
      case 'settings':
        if (settingsView === 'editName') {
          return (
            <EditNameScreen 
              ref={editNameRef}
              currentDisplayName={currentDisplayName}
              onSave={handleEditDisplayName}
              onCancel={handleCancelEditName}
            />
          );
        }
        return (
          <SettingsScreen 
            selectedIndex={selectedIndex}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
            currentView={settingsView}
          />
        );
      default:
        return null;
    }
  };

  return (
    <NativeBaseProvider theme={retroTheme}>
      <LinearGradient
        colors={['#d4d4d4', '#a8a8a8', '#c0c0c0', '#909090', '#b8b8b8', '#888888', '#a0a0a0']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.15, 0.3, 0.5, 0.65, 0.8, 1]}
      >
        
        {/* Subtle dot pattern for tech aesthetic */}
        {/* <BackgroundPattern /> */}

        <PagerDisplay>
          {renderScreen()}
        </PagerDisplay>

        {/* Use ChatPagerBody for edit name mode, regular PagerBody otherwise */}
        {currentScreen === 'settings' && settingsView === 'editName' ? (
          <ChatPagerBody
            onConfirm={() => editNameRef.current?.handleSubmit()}
            onBack={handleBack}
            onMenu={handleMenu}
            onNumberPress={handleNumberPress}
            onCall={handleCall}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        ) : (
          <PagerBody
            onSelect={handleSelect}
            onBack={handleBack}
            onNavigateUp={() => navigate('up')}
            onNavigateDown={() => navigate('down')}
            onMenu={handleMenu}
            onNavigateLeft={handleNavigateLeft}
            onNavigateRight={handleNavigateRight}
            onNumberPress={handleNumberPress}
            onCall={handleCall}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        )}
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
    paddingBottom: 0,
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
