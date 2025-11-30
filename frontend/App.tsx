import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { retroTheme } from './src/theme';
import * as Font from 'expo-font';
import { PagerDisplay } from './src/components/PagerDisplay';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { IndividualChatScreen } from './src/screens/IndividualChatScreen';
import { FriendsListScreen } from './src/screens/FriendsListScreen';
import { AddFriendScreen } from './src/screens/AddFriendScreen';
import { FriendRequestsScreen } from './src/screens/FriendRequestsScreen';
import { FriendRequestConfirmationScreen } from './src/screens/FriendRequestConfirmationScreen';
import { MyHexScreen } from './src/screens/MyHexScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NameEntryScreen, NameEntryScreenHandle } from './src/screens/NameEntryScreen';
import { EditNameScreen, EditNameScreenHandle } from './src/screens/EditNameScreen';
import { IndividualChatScreenHandle } from './src/screens/IndividualChatScreen';
import { LiveActivityDemoScreen, LiveActivityDemoScreenHandle } from './src/screens/LiveActivityDemoScreen';
import { PagerBody } from './src/components/PagerBody';
import { ChatPagerBody } from './src/components/ChatPagerBody';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import { useFriends } from './src/hooks/useFriends';
import { getAllDisplayNameMappings } from './src/services/storageService';
import { setCurrentUserDisplayName } from './src/services/displayNameService';
import { areActivitiesEnabled, registerPushTokenWithBackend } from './src/services/liveActivityService';
import { sendFriendRequest } from './src/services/apiClient';

type Screen = 'main' | 'messages' | 'chat' | 'friends' | 'addFriend' | 'friendRequests' | 'friendRequestConfirmation' | 'myhex' | 'settings' | 'editName' | 'liveActivityDemo';

const mainMenu = [
  { id: 'messages', label: '1. MESSAGES', screen: 'messages' as Screen },
  { id: 'friends', label: '2. FRIENDS', screen: 'friends' as Screen },
  { id: 'myhex', label: '3. MY HEX', screen: 'myhex' as Screen },
  { id: 'settings', label: '4. SETTINGS', screen: 'settings' as Screen },
  { id: 'liveActivity', label: '5. LIVE ACTIVITY', screen: 'liveActivityDemo' as Screen },
];

// mockFriends removed - now using useFriends hook for real API data
// Requirements: 3.1, 3.2

const mockFriendRequests = [
  { sixDigitCode: '111222', timestamp: '2024-11-19T10:30:00' },
  { sixDigitCode: '333444', timestamp: '2024-11-19T09:15:00' },
];

// Mock unread messages - in real app, this would come from API
// Only shows friends who have sent you unread messages
const mockMessages = [
  { from: '123456', text: 'HELLO THERE!', time: '14:30' },
  { from: '789012', text: 'HOW ARE YOU?', time: '12:15' },
];

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const { isLoading, isAuthenticated, hexCode, updateDisplayName: authUpdateDisplayName, logout } = useAuth();
  
  // Real friends data from backend (Requirements: 3.1, 3.2)
  const { friends: realFriends, isLoading: friendsLoading, error: friendsError, refresh: refreshFriends } = useFriends();
  
  // Selected friend for chat
  const [selectedFriend, setSelectedFriend] = useState<{ sixDigitCode: string; displayName?: string } | null>(null);
  
  // Display name state
  const [displayNameMap, setDisplayNameMap] = useState<Record<string, string>>({});
  const nameEntryRef = useRef<NameEntryScreenHandle>(null);
  const editNameRef = useRef<EditNameScreenHandle>(null);
  const chatScreenRef = useRef<IndividualChatScreenHandle>(null);
  const liveActivityDemoRef = useRef<LiveActivityDemoScreenHandle>(null);
  
  // Add friend state
  const [friendRequestInput, setFriendRequestInput] = useState('');
  const [friendRequestError, setFriendRequestError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Hex T9 input state (for cycling through hex chars on same key)
  const hexT9State = useRef({
    currentKey: null as string | null,
    keyPressCount: 0,
    lastKeyPressTime: 0,
    timeoutId: null as NodeJS.Timeout | null,
  });
  
  // Hex T9 map: key -> [chars to cycle through]
  // Number first, then letters (2 → A → B → C)
  const HEX_T9_MAP: Record<string, string[]> = {
    '0': ['0', ' '],
    '1': ['1'],
    '2': ['2', 'A', 'B', 'C'],
    '3': ['3', 'D', 'E', 'F'],
    '4': ['4', 'G', 'H', 'I'],
    '5': ['5', 'J', 'K', 'L'],
    '6': ['6', 'M', 'N', 'O'],
    '7': ['7', 'P', 'Q', 'R', 'S'],
    '8': ['8', 'T', 'U', 'V'],
    '9': ['9', 'W', 'X', 'Y', 'Z'],
  };
  
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

  // Load display name mappings after authentication
  // Requirements: 11.1 - Load display name data after user is authenticated
  const { register } = useAuth();
  
  useEffect(() => {
    async function loadDisplayNameData() {
      // Only load display name data after user is authenticated
      if (fontLoaded && isAuthenticated && hexCode) {
        // Load display name mappings
        const mappings = await getAllDisplayNameMappings();
        setDisplayNameMap(mappings);
        
        // Load current user's display name
        const { getCurrentUserDisplayName } = await import('./src/services/displayNameService');
        const name = await getCurrentUserDisplayName();
        setCurrentDisplayName(name || hexCode);
      }
    }
    loadDisplayNameData();
  }, [isAuthenticated, hexCode, fontLoaded]);

  // No auto-registration - user must enter name first
  // Registration happens when user submits their name

  // Register Live Activity push token with backend on startup
  // Requirements: 9.1, 9.2, 9.3
  const { authToken } = useAuth();
  
  useEffect(() => {
    async function registerLiveActivityToken() {
      // Only register if authenticated and have an auth token
      if (!isAuthenticated || !authToken) {
        console.log('[LiveActivity] Skipping token registration - not authenticated');
        return;
      }
      
      try {
        // Check if Live Activities are enabled on this device
        const enabled = await areActivitiesEnabled();
        if (!enabled) {
          console.log('[LiveActivity] Live Activities not enabled on this device');
          return;
        }
        
        console.log('[LiveActivity] Live Activities enabled, registering push token...');
        
        // Register the push token with the backend
        const success = await registerPushTokenWithBackend(authToken);
        if (success) {
          console.log('[LiveActivity] Push token registered successfully');
        } else {
          console.log('[LiveActivity] Push token registration failed or not available');
        }
      } catch (error) {
        console.error('[LiveActivity] Error registering push token:', error);
      }
    }
    
    // Only run after fonts are loaded and auth state is determined
    if (fontLoaded && !isLoading) {
      registerLiveActivityToken();
    }
  }, [isAuthenticated, authToken, fontLoaded, isLoading]);

  // Handle display name set during initial registration
  // Requirements: 11.1, 11.2 - Register user with backend and save display name
  const handleDisplayNameSet = async (displayName: string) => {
    console.log('🔍 handleDisplayNameSet called with:', displayName);
    console.log('   isAuthenticated:', isAuthenticated);
    
    try {
      if (isAuthenticated) {
        // Already authenticated - just update display name
        console.log('📤 Updating display name on backend...');
        await authUpdateDisplayName(displayName);
        console.log('✅ Display name updated on backend');
        
        // Save locally
        if (hexCode) {
          await setCurrentUserDisplayName(hexCode, displayName);
        }
      } else {
        // Not authenticated - register with display name
        console.log('📱 Registering new user with display name...');
        await register(displayName);
        console.log('✅ User registered with display name');
        
        // Register Live Activity token after successful registration
        // This will be handled by the useEffect that watches isAuthenticated
      }
      
      // Reload mappings
      const mappings = await getAllDisplayNameMappings();
      setDisplayNameMap(mappings);
    } catch (error) {
      console.error('Failed to set display name:', error);
      throw error; // Re-throw to let NameEntryScreen handle the error display
    }
  };

  // Handle skip display name - register without display name
  // Requirements: 11.3 - When user skips, register and use hex code as default
  const handleSkipDisplayName = async () => {
    try {
      if (isAuthenticated) {
        // Already authenticated - nothing to do
        console.log('Already authenticated, skipping name entry');
      } else {
        // Not authenticated - register without display name
        console.log('📱 Registering new user without display name...');
        await register();
        console.log('✅ User registered (will use hex code as default)');
      }
      
      // Reload mappings
      const mappings = await getAllDisplayNameMappings();
      setDisplayNameMap(mappings);
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  // Handle edit display name
  // Requirements: 12.1, 12.2, 12.3 - Update display name on backend and locally
  const handleEditDisplayName = async (newDisplayName: string) => {
    // User must be authenticated to edit display name
    if (!isAuthenticated || !hexCode) {
      throw new Error('Not authenticated');
    }
    
    // Send to backend
    console.log('📤 Updating display name on backend...');
    await authUpdateDisplayName(newDisplayName);
    console.log('✅ Display name updated on backend');
    
    // Requirements: 12.2, 12.3 - Update local state on success
    await setCurrentUserDisplayName(hexCode, newDisplayName);
    setCurrentDisplayName(newDisplayName);
    
    // Reload mappings
    const mappings = await getAllDisplayNameMappings();
    setDisplayNameMap(mappings);
    
    // Return to settings main
    setSettingsView('main');
  };

  const handleCancelEditName = () => {
    setSettingsView('main');
  };

  // Handle logout - clears all user data and shows name entry screen
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await logout();
      
      // Reset app state
      setCurrentScreen('main');
      setSelectedIndex(0);
      setDisplayNameMap({});
      setCurrentDisplayName('');
      setSettingsView('main');
      
      console.log('✅ Logged out - will show name entry screen');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
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

  // Show name entry screen if not authenticated (new user registration)
  if (!isAuthenticated) {
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
            onCall={() => {
              // Call button triggers submit or retry depending on state
              nameEntryRef.current?.handleSubmit();
            }}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        </LinearGradient>
      </NativeBaseProvider>
    );
  }

  const navigate = (direction: 'up' | 'down') => {
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
      maxIndex = Math.max(0, menuItems + realFriends.length - 1);
    } else if (currentScreen === 'friendRequests') {
      maxIndex = mockFriendRequests.length - 1;
    } else if (currentScreen === 'messages') {
      maxIndex = mockMessages.length - 1;
    } else if (currentScreen === 'settings') {
      maxIndex = 5; // Sound, Vibrate, Edit Name, About, Help, Logout
    } else if (currentScreen === 'liveActivityDemo') {
      maxIndex = 4; // Start, Prev, Next, End, End All
    }

    if (direction === 'up' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'down' && selectedIndex < maxIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleNavigateLeft = () => {
    // On confirmation screen, focus "NO"
    if (currentScreen === 'friendRequestConfirmation') {
      setConfirmationFocusedButton('no');
      return;
    }
    
    // No-op for other screens
    console.log('Navigate left (not yet implemented)');
  };

  const handleNavigateRight = () => {
    // On confirmation screen, focus "YES"
    if (currentScreen === 'friendRequestConfirmation') {
      setConfirmationFocusedButton('yes');
      return;
    }
    
    // No-op for other screens
    console.log('Navigate right (not yet implemented)');
  };

  const handleSelect = () => {
    if (currentScreen === 'main') {
      const selected = mainMenu[selectedIndex];
      setCurrentScreen(selected.screen);
      setSelectedIndex(0);
    } else if (currentScreen === 'messages') {
      // Navigate to chat with selected message sender
      const message = mockMessages[selectedIndex];
      if (message) {
        setSelectedFriend({ sixDigitCode: message.from });
        setCurrentScreen('chat');
      }
    } else if (currentScreen === 'friends') {
      // Handle friends list selection
      const hasRequests = mockFriendRequests.length > 0;
      const menuItemsCount = 1 + (hasRequests ? 1 : 0);
      
      if (selectedIndex === 0) {
        // ADD FRIEND selected
        setCurrentScreen('addFriend');
        setFriendRequestInput('');
        setFriendRequestError('');
      } else if (hasRequests && selectedIndex === 1) {
        // REQUESTS selected
        setCurrentScreen('friendRequests');
        setSelectedIndex(0);
      } else if (selectedIndex >= menuItemsCount) {
        // Friend selected - navigate to chat
        const friendIndex = selectedIndex - menuItemsCount;
        const friend = realFriends[friendIndex];
        if (friend) {
          setSelectedFriend({ 
            sixDigitCode: friend.sixDigitCode, 
            displayName: friend.displayName || undefined 
          });
          setCurrentScreen('chat');
        }
      }
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
        case 5: // Logout
          handleLogout();
          break;
      }
    } else if (currentScreen === 'liveActivityDemo') {
      // Delegate to Live Activity demo screen
      liveActivityDemoRef.current?.handleSelect();
    }
  };

  const handleBack = () => {
    if (currentScreen === 'chat') {
      // Return to messages screen
      setCurrentScreen('messages');
      setSelectedFriend(null);
      setSelectedIndex(0);
      return;
    }
    
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

  const HEX_T9_TIMEOUT_MS = 1000; // 1 second between key presses

  const handleNumberPress = (number: string) => {
    // Handle number presses on Add Friend screen (8-char hex code with T9-style input)
    if (currentScreen === 'addFriend') {
      if (number === '#') {
        // Backspace - remove last character
        if (friendRequestInput.length > 0) {
          setFriendRequestInput(friendRequestInput.slice(0, -1));
        }
        // Reset T9 state
        if (hexT9State.current.timeoutId) {
          clearTimeout(hexT9State.current.timeoutId);
        }
        hexT9State.current.currentKey = null;
        hexT9State.current.keyPressCount = 0;
      } else if (number >= '0' && number <= '9') {
        const now = Date.now();
        const state = hexT9State.current;
        const chars = HEX_T9_MAP[number];
        
        // Safety check - if no mapping, just use the number
        if (!chars || chars.length === 0) {
          if (friendRequestInput.length < 8) {
            setFriendRequestInput(prev => prev + number);
          }
          return;
        }
        
        // Clear existing timeout
        if (state.timeoutId) {
          clearTimeout(state.timeoutId);
        }
        
        // Check if same key pressed within timeout
        if (number === state.currentKey && (now - state.lastKeyPressTime) < HEX_T9_TIMEOUT_MS) {
          // Cycle to next character
          state.keyPressCount++;
          const charIndex = state.keyPressCount % chars.length;
          // Replace last character with new one
          setFriendRequestInput(prev => prev.slice(0, -1) + chars[charIndex]);
        } else {
          // New key or timeout expired - add first character (if room)
          if (friendRequestInput.length < 8) {
            state.currentKey = number;
            state.keyPressCount = 0;
            setFriendRequestInput(prev => prev + chars[0]);
          }
        }
        
        state.lastKeyPressTime = now;
        
        // Set timeout to finalize character
        state.timeoutId = setTimeout(() => {
          state.currentKey = null;
          state.keyPressCount = 0;
        }, HEX_T9_TIMEOUT_MS);
      }
      return; // Don't process further for addFriend screen
    }
    
    // Handle number presses on Edit Name screen
    if (currentScreen === 'settings' && settingsView === 'editName') {
      if (number === '#') {
        editNameRef.current?.handleBackspace();
      } else if (number >= '0' && number <= '9') {
        editNameRef.current?.handleNumberPress(number);
      }
    }
    
    // Chat screen handles its own number presses via IndividualChatScreen
    // No need to handle here
  };

  const handleCall = () => {
    // On Add Friend screen, call button sends the friend request (8-char hex code)
    if (currentScreen === 'addFriend' && friendRequestInput.length === 8) {
      handleSendFriendRequest(friendRequestInput);
    }
    
    // On Edit Name screen, call button saves the name
    if (currentScreen === 'settings' && settingsView === 'editName') {
      editNameRef.current?.handleSubmit();
    }
    
    // Chat screen handles its own call button via IndividualChatScreen
    // No need to handle here
  };

  // Chat screen specific handlers
  const handleChatNumberPress = (key: string) => {
    chatScreenRef.current?.handleNumberPress(key);
  };

  const handleChatCall = () => {
    chatScreenRef.current?.handleCall();
  };

  const handleConfirm = () => {
    chatScreenRef.current?.handleConfirm();
  };

  const handleSendFriendRequest = async (hexCode: string) => {
    // Uppercase the hex code before sending to backend
    const uppercaseHexCode = hexCode.toUpperCase();
    console.log('📤 Sending friend request to:', uppercaseHexCode);
    setIsProcessing(true);
    setFriendRequestError('');
    
    try {
      // Get auth token
      if (!authToken) {
        throw new Error('NOT_AUTHENTICATED');
      }
      
      // Send friend request via API
      await sendFriendRequest(authToken, uppercaseHexCode);
      
      console.log('✅ Friend request sent successfully');
      
      // Clear and navigate back to friends list
      setFriendRequestInput('');
      setFriendRequestError('');
      setCurrentScreen('friends');
      setSelectedIndex(0);
      
      // Refresh friends list
      refreshFriends();
    } catch (error) {
      console.error('❌ Failed to send friend request:', error);
      
      // Map error to user-friendly message
      let errorMessage = 'SEND FAILED';
      if (error instanceof Error) {
        if (error.message === 'USER_NOT_FOUND') {
          errorMessage = 'USER NOT FOUND';
        } else if (error.message === 'REQUEST_ALREADY_SENT') {
          errorMessage = 'ALREADY SENT';
        } else if (error.message === 'ALREADY_FRIENDS') {
          errorMessage = 'ALREADY FRIENDS';
        } else if (error.message === 'NOT_AUTHENTICATED') {
          errorMessage = 'NOT LOGGED IN';
        } else if (error.message.includes('Network')) {
          errorMessage = 'NETWORK ERROR';
        }
      }
      
      setFriendRequestError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
      case 'chat':
        return selectedFriend ? (
          <IndividualChatScreen
            ref={chatScreenRef}
            friend={selectedFriend}
            onBack={handleBack}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
            displayNameMap={displayNameMap}
          />
        ) : null;
      case 'friends':
        return (
          <FriendsListScreen 
            friends={realFriends} 
            selectedIndex={selectedIndex}
            pendingRequestsCount={mockFriendRequests.length}
            displayNameMap={displayNameMap}
          />
        );
      case 'addFriend':
        return (
          <AddFriendScreen 
            hexInput={friendRequestInput}
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
      case 'liveActivityDemo':
        return <LiveActivityDemoScreen ref={liveActivityDemoRef} selectedIndex={selectedIndex} />;
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

        {/* Use ChatPagerBody for chat and text input screens, regular PagerBody otherwise */}
        {currentScreen === 'chat' ? (
          <ChatPagerBody
            onConfirm={handleConfirm}
            onBack={handleBack}
            onMenu={handleMenu}
            onNumberPress={handleChatNumberPress}
            onCall={handleChatCall}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        ) : currentScreen === 'settings' && settingsView === 'editName' ? (
          <ChatPagerBody
            onConfirm={() => editNameRef.current?.handleSubmit()}
            onBack={handleBack}
            onMenu={handleMenu}
            onNumberPress={handleNumberPress}
            onCall={handleCall}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        ) : currentScreen === 'addFriend' ? (
          <ChatPagerBody
            onConfirm={() => {
              // Confirm button finalizes current T9 character (moves to next position)
              if (hexT9State.current.timeoutId) {
                clearTimeout(hexT9State.current.timeoutId);
              }
              hexT9State.current.currentKey = null;
              hexT9State.current.keyPressCount = 0;
            }}
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
