import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
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
import { GamesMenuScreen } from './src/screens/GamesMenuScreen';
import { SnakeGameScreen, SnakeGameScreenHandle } from './src/screens/SnakeGameScreen';
import { SnakeLeaderboardScreen } from './src/screens/SnakeLeaderboardScreen';
import { getSnakeLeaderboard, addSnakeScore, LeaderboardEntry } from './src/services/gameService';
import { PagerBody } from './src/components/PagerBody';
import { ChatPagerBody } from './src/components/ChatPagerBody';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import { useFriends } from './src/hooks/useFriends';
import { useFriendRequests } from './src/hooks/useFriendRequests';
import { useConversations } from './src/hooks/useConversations';
import { getAllDisplayNameMappings } from './src/services/storageService';
import { setCurrentUserDisplayName } from './src/services/displayNameService';
import { areActivitiesEnabled, registerPushTokenWithBackend } from './src/services/liveActivityService';
import { sendFriendRequest, updateUserStatus } from './src/services/apiClient';

type Screen = 'main' | 'messages' | 'chat' | 'friends' | 'addFriend' | 'friendRequests' | 'friendRequestConfirmation' | 'myhex' | 'settings' | 'editName' | 'liveActivityDemo' | 'games' | 'snakeGame' | 'snakeLeaderboard';

const mainMenu = [
  { id: 'messages', label: '1. MESSAGES', screen: 'messages' as Screen },
  { id: 'friends', label: '2. FRIENDS', screen: 'friends' as Screen },
  { id: 'myhex', label: '3. MY HEX', screen: 'myhex' as Screen },
  { id: 'games', label: '4. GAMES', screen: 'games' as Screen },
  { id: 'settings', label: '5. SETTINGS', screen: 'settings' as Screen },
];

// mockFriends removed - now using useFriends hook for real API data
// Requirements: 3.1, 3.2

// mockFriendRequests removed - now using useFriendRequests hook for real API data
// Requirements: 5.1, 5.2

// mockMessages removed - now using useConversations hook for real API data
// Requirements: 10.1, 10.2

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const { isLoading, isAuthenticated, hexCode, updateDisplayName: authUpdateDisplayName, logout } = useAuth();
  
  // Real friends data from backend (Requirements: 3.1, 3.2)
  const { friends: realFriends, isLoading: friendsLoading, error: friendsError, refresh: refreshFriends } = useFriends();
  
  // Real friend requests data from backend (Requirements: 5.1, 5.2)
  const { 
    requests: realFriendRequests, 
    isLoading: requestsLoading, 
    error: requestsError, 
    refresh: refreshRequests,
    acceptRequest: apiAcceptRequest,
    rejectRequest: apiRejectRequest
  } = useFriendRequests();
  
  // Real conversations data from backend (Requirements: 10.1, 10.2)
  const {
    conversations: realConversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refresh: refreshConversations
  } = useConversations();
  
  // Selected friend for chat
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; sixDigitCode: string; displayName?: string } | null>(null);
  
  // Track where chat was entered from (for proper back navigation)
  const [chatEnteredFrom, setChatEnteredFrom] = useState<'messages' | 'friends'>('messages');
  
  // Display name state
  const [displayNameMap, setDisplayNameMap] = useState<Record<string, string>>({});
  const nameEntryRef = useRef<NameEntryScreenHandle>(null);
  const editNameRef = useRef<EditNameScreenHandle>(null);
  const chatScreenRef = useRef<IndividualChatScreenHandle>(null);
  const liveActivityDemoRef = useRef<LiveActivityDemoScreenHandle>(null);
  const snakeGameRef = useRef<SnakeGameScreenHandle>(null);
  
  // Games state
  const [snakeLeaderboard, setSnakeLeaderboard] = useState<LeaderboardEntry[]>([]);
  
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
  // Updated to include id for API calls (Requirements: 5.3, 5.4)
  const [confirmingRequest, setConfirmingRequest] = useState<{ id: string; sixDigitCode: string; timestamp: string; displayName?: string } | null>(null);
  const [confirmationFocusedButton, setConfirmationFocusedButton] = useState<'yes' | 'no' | null>(null);

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [settingsView, setSettingsView] = useState<'main' | 'about' | 'help' | 'editName'>('main');
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('');

  // Set up notification handlers
  // Requirements: 8.3, 8.4 - Handle message notifications and navigate to chat on tap
  useNotifications({
    onNotificationReceived: (data) => {
      console.log('📬 Notification received:', data);
      // Refresh conversations when a new message notification arrives
      if (data.type === 'MESSAGE' || data.type === 'LIVE_ACTIVITY_START') {
        refreshConversations();
      }
      // Refresh friend requests when a friend request notification arrives
      if (data.type === 'FRIEND_REQUEST') {
        refreshRequests();
      }
      // Refresh friends list when a friend request is accepted
      if (data.type === 'FRIEND_ACCEPTED') {
        refreshFriends();
      }
    },
    onNotificationTapped: (data) => {
      console.log('👆 Notification tapped:', data);
      // Navigate to appropriate screen based on notification type
      if (data.type === 'FRIEND_REQUEST') {
        setCurrentScreen('friendRequests');
        setSelectedIndex(0);
        refreshRequests();
      } else if (data.type === 'FRIEND_ACCEPTED') {
        setCurrentScreen('friends');
        setSelectedIndex(0);
        refreshFriends();
      }
    },
    // Requirements: 8.3 - Handle message notification received
    onMessageReceived: (messageData) => {
      console.log('📟 Message notification received:', messageData);
      // Refresh conversations to show new message
      refreshConversations();
    },
    // Requirements: 8.4 - Navigate to chat on notification tap
    onMessageTapped: (messageData) => {
      console.log('📟 Message notification tapped, navigating to chat:', messageData);
      // Navigate to chat with the sender
      if (messageData.senderId) {
        // Find the friend in our friends list to get their hex code
        const friend = realFriends.find(f => f.id === messageData.senderId);
        if (friend && friend.id) {
          setSelectedFriend({
            id: friend.id,
            sixDigitCode: friend.sixDigitCode,
            displayName: friend.displayName || messageData.senderName || undefined,
          });
          setChatEnteredFrom('messages');
          setCurrentScreen('chat');
        } else {
          // Friend not found in list, try to navigate to messages screen
          // and refresh to get the latest data
          refreshConversations();
          setCurrentScreen('messages');
          setSelectedIndex(0);
        }
      }
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

  // Update displayNameMap when friends data changes (from API)
  // This ensures we show friend display names from the backend
  useEffect(() => {
    if (realFriends.length > 0) {
      setDisplayNameMap(prev => {
        const updated = { ...prev };
        realFriends.forEach(friend => {
          if (friend.displayName) {
            updated[friend.sixDigitCode] = friend.displayName;
          }
        });
        return updated;
      });
    }
  }, [realFriends]);

  // No auto-registration - user must enter name first
  // Registration happens when user submits their name

  // Register Live Activity push token with backend on startup and after login
  // Requirements: 2.3, 2.4, 9.1, 9.2, 9.3
  const { authToken } = useAuth();
  
  useEffect(() => {
    async function registerLiveActivityToken() {
      // Only register if authenticated and have an auth token
      if (!isAuthenticated || !authToken) {
        console.log('[LiveActivity] Skipping token registration - not authenticated');
        return;
      }
      
      try {
        // Small delay to ensure the system is ready after authentication
        // This helps when user logs out and logs back in
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if Live Activities are enabled on this device
        const enabled = await areActivitiesEnabled();
        if (!enabled) {
          console.log('[LiveActivity] Live Activities not enabled on this device');
          return;
        }
        
        console.log('[LiveActivity] Live Activities enabled, registering push token...');
        
        // Always try to register on startup - force refresh to ensure we have the latest token
        // This is important because:
        // 1. The token might have changed since last registration
        // 2. The backend might have lost the token (e.g., database reset)
        // 3. The previous registration might have failed silently
        const success = await registerPushTokenWithBackend(authToken, true); // Force refresh
        if (success) {
          console.log('[LiveActivity] Push token registered successfully');
        } else {
          console.log('[LiveActivity] Push token registration failed or not available');
          // Retry once after a delay if first attempt fails
          // The token might not be available immediately after app launch
          console.log('[LiveActivity] Retrying token registration in 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          const retrySuccess = await registerPushTokenWithBackend(authToken, true);
          if (retrySuccess) {
            console.log('[LiveActivity] Push token registered successfully on retry');
          } else {
            console.log('[LiveActivity] Push token registration failed on retry');
            console.log('[LiveActivity] Token may not be available yet - will retry on next foreground');
          }
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

  // Re-register Live Activity token when app comes to foreground
  // Requirements: 2.3 - Re-register token when app becomes active
  useEffect(() => {
    // Only track if authenticated
    if (!isAuthenticated || !authToken) {
      return;
    }

    // Debounce to avoid excessive API calls
    let debounceTimeout: NodeJS.Timeout | null = null;
    let lastRegistrationTime = 0;
    const DEBOUNCE_MS = 5000; // 5 seconds minimum between registrations

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check if enough time has passed since last registration
        const now = Date.now();
        if (now - lastRegistrationTime < DEBOUNCE_MS) {
          console.log('[LiveActivity] Skipping foreground re-registration (debounced)');
          return;
        }

        // Clear any pending debounce
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        // Debounce the registration
        debounceTimeout = setTimeout(async () => {
          try {
            const enabled = await areActivitiesEnabled();
            if (!enabled) {
              return;
            }

            console.log('[LiveActivity] App became active, re-registering token...');
            lastRegistrationTime = Date.now();
            
            // Force refresh to ensure token is up-to-date
            const success = await registerPushTokenWithBackend(authToken, true);
            if (success) {
              console.log('[LiveActivity] Token re-registered on foreground');
            }
          } catch (error) {
            console.error('[LiveActivity] Failed to re-register token on foreground:', error);
          }
        }, 500); // Small delay to let the system settle
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [isAuthenticated, authToken]);

  // Track app state for online/offline status updates
  // Requirements: 14.1, 14.2 - Update status when app becomes active/background
  useEffect(() => {
    // Only track status if authenticated
    if (!isAuthenticated || !authToken) {
      return;
    }

    // Track the current app state to avoid duplicate updates
    let currentAppState = AppState.currentState;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Only update if state actually changed
      if (currentAppState === nextAppState) {
        return;
      }

      const previousState = currentAppState;
      currentAppState = nextAppState;

      try {
        if (nextAppState === 'active' && previousState !== 'active') {
          // App became active - update status to online
          // Requirements: 14.1 - Update status to "online" when app becomes active
          console.log('[Status] App became active, updating status to online');
          await updateUserStatus(authToken, 'online');
          console.log('[Status] Status updated to online');
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App went to background - update status to offline
          // Requirements: 14.2 - Update status to "offline" when app goes to background
          if (previousState === 'active') {
            console.log('[Status] App went to background, updating status to offline');
            await updateUserStatus(authToken, 'offline');
            console.log('[Status] Status updated to offline');
          }
        }
      } catch (error) {
        // Status update is best-effort, don't crash the app
        console.error('[Status] Failed to update status:', error);
      }
    };

    // Set initial status to online when component mounts (user is authenticated)
    const setInitialStatus = async () => {
      try {
        console.log('[Status] Setting initial status to online');
        await updateUserStatus(authToken, 'online');
        console.log('[Status] Initial status set to online');
      } catch (error) {
        console.error('[Status] Failed to set initial status:', error);
      }
    };

    // Set initial status
    setInitialStatus();

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup: set status to offline when component unmounts
    return () => {
      subscription.remove();
      // Note: We can't reliably await here, but we try to update status
      updateUserStatus(authToken, 'offline').catch(error => {
        console.error('[Status] Failed to set offline status on unmount:', error);
      });
    };
  }, [isAuthenticated, authToken]);

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
            onBack={() => {
              // Back button does nothing on registration screen
              // User must complete registration or skip
            }}
            onMenu={() => {
              // Menu button does nothing on registration screen
            }}
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
    // Snake game uses navigation keys for movement
    if (currentScreen === 'snakeGame') {
      if (direction === 'up') {
        snakeGameRef.current?.handleDirection('UP');
      } else {
        snakeGameRef.current?.handleDirection('DOWN');
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
      const menuItems = 1 + (realFriendRequests.length > 0 ? 1 : 0);
      maxIndex = Math.max(0, menuItems + realFriends.length - 1);
    } else if (currentScreen === 'friendRequests') {
      maxIndex = realFriendRequests.length - 1;
    } else if (currentScreen === 'messages') {
      maxIndex = realConversations.length - 1;
    } else if (currentScreen === 'settings') {
      maxIndex = 5; // Sound, Vibrate, Edit Name, About, Help, Logout
    } else if (currentScreen === 'liveActivityDemo') {
      maxIndex = 4; // Start, Prev, Next, End, End All
    } else if (currentScreen === 'games') {
      maxIndex = 1; // Snake, Leaderboard
    }

    if (direction === 'up' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'down' && selectedIndex < maxIndex) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleNavigateLeft = () => {
    // Snake game uses navigation keys for movement
    if (currentScreen === 'snakeGame') {
      snakeGameRef.current?.handleDirection('LEFT');
      return;
    }
    
    // On confirmation screen, focus "NO"
    if (currentScreen === 'friendRequestConfirmation') {
      setConfirmationFocusedButton('no');
      return;
    }
  };

  const handleNavigateRight = () => {
    // Snake game uses navigation keys for movement
    if (currentScreen === 'snakeGame') {
      snakeGameRef.current?.handleDirection('RIGHT');
      return;
    }
    
    // On confirmation screen, focus "YES"
    if (currentScreen === 'friendRequestConfirmation') {
      setConfirmationFocusedButton('yes');
      return;
    }
  };

  const handleSelect = () => {
    if (currentScreen === 'main') {
      const selected = mainMenu[selectedIndex];
      setCurrentScreen(selected.screen);
      setSelectedIndex(0);
      
      // Refresh data when navigating to friends screen
      if (selected.screen === 'friends') {
        refreshFriends();
        refreshRequests();
      }
      
      // Refresh conversations when navigating to messages screen
      // Requirements: 10.1 - Fetch conversations with unread messages
      if (selected.screen === 'messages') {
        refreshConversations();
      }
    } else if (currentScreen === 'messages') {
      // Navigate to chat with selected conversation sender
      // Requirements: 10.3 - Navigate to chat with that friend
      const conversation = realConversations[selectedIndex];
      if (conversation && conversation.friendId) {
        setSelectedFriend({ 
          id: conversation.friendId,
          sixDigitCode: conversation.from,
          displayName: conversation.displayName || undefined
        });
        setChatEnteredFrom('messages');
        setCurrentScreen('chat');
      }
    } else if (currentScreen === 'friends') {
      // Handle friends list selection
      const hasRequests = realFriendRequests.length > 0;
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
        if (friend && friend.id) {
          setSelectedFriend({ 
            id: friend.id,
            sixDigitCode: friend.sixDigitCode, 
            displayName: friend.displayName || undefined 
          });
          setChatEnteredFrom('friends');
          setCurrentScreen('chat');
        }
      }
    } else if (currentScreen === 'friendRequests') {
      // Navigate to confirmation screen
      const request = realFriendRequests[selectedIndex];
      if (request) {
        setConfirmingRequest(request);
        setConfirmationFocusedButton('yes'); // Default to yes
        setCurrentScreen('friendRequestConfirmation');
      }
    } else if (currentScreen === 'friendRequestConfirmation') {
      // Execute accept or reject based on focused button
      // Requirements: 5.3, 5.4 - Use request ID for API calls
      if (confirmingRequest && confirmationFocusedButton && 'id' in confirmingRequest) {
        if (confirmationFocusedButton === 'yes') {
          handleAcceptRequest(confirmingRequest.id);
        } else {
          handleRejectRequest(confirmingRequest.id);
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
    } else if (currentScreen === 'games') {
      // Handle games menu selection
      if (selectedIndex === 0) {
        // Snake game
        setCurrentScreen('snakeGame');
      } else if (selectedIndex === 1) {
        // Leaderboard
        loadSnakeLeaderboard();
        setCurrentScreen('snakeLeaderboard');
      }
    } else if (currentScreen === 'snakeGame') {
      // Delegate to snake game
      snakeGameRef.current?.handleSelect();
    }
  };

  // Load snake leaderboard
  const loadSnakeLeaderboard = async () => {
    const scores = await getSnakeLeaderboard();
    setSnakeLeaderboard(scores);
  };

  // Handle snake game over
  const handleSnakeGameOver = async (score: number) => {
    if (score > 0) {
      await addSnakeScore(score);
      await loadSnakeLeaderboard();
    }
  };

  const handleBack = () => {
    if (currentScreen === 'chat') {
      // Return to the screen we came from (messages or friends)
      setCurrentScreen(chatEnteredFrom);
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
    
    if (currentScreen === 'snakeGame' || currentScreen === 'snakeLeaderboard') {
      // Return to games menu
      setCurrentScreen('games');
      setSelectedIndex(0);
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
    
    // Handle snake game controls (2=UP, 4=LEFT, 6=RIGHT, 8=DOWN)
    if (currentScreen === 'snakeGame') {
      switch (number) {
        case '2':
          snakeGameRef.current?.handleDirection('UP');
          break;
        case '4':
          snakeGameRef.current?.handleDirection('LEFT');
          break;
        case '6':
          snakeGameRef.current?.handleDirection('RIGHT');
          break;
        case '8':
          snakeGameRef.current?.handleDirection('DOWN');
          break;
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

  // Handle accept friend request via API
  // Requirements: 5.3, 5.5, 5.6
  const handleAcceptRequest = async (requestId: string) => {
    console.log('📤 Accepting friend request:', requestId);
    setIsProcessing(true);
    
    try {
      const success = await apiAcceptRequest(requestId);
      
      if (success) {
        console.log('✅ Friend request accepted');
        // Refresh friends list to show new friend (Requirement 5.5)
        refreshFriends();
      } else {
        console.error('❌ Failed to accept friend request');
      }
    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
    } finally {
      setIsProcessing(false);
      setCurrentScreen('friendRequests');
      setConfirmingRequest(null);
      setConfirmationFocusedButton(null);
      setSelectedIndex(0);
    }
  };

  // Handle reject friend request via API
  // Requirements: 5.4, 5.6
  const handleRejectRequest = async (requestId: string) => {
    console.log('📤 Rejecting friend request:', requestId);
    setIsProcessing(true);
    
    try {
      const success = await apiRejectRequest(requestId);
      
      if (success) {
        console.log('✅ Friend request rejected');
      } else {
        console.error('❌ Failed to reject friend request');
      }
    } catch (error) {
      console.error('❌ Error rejecting friend request:', error);
    } finally {
      setIsProcessing(false);
      setCurrentScreen('friendRequests');
      setConfirmingRequest(null);
      setConfirmationFocusedButton(null);
      setSelectedIndex(0);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenuScreen menuItems={mainMenu} selectedIndex={selectedIndex} />;
      case 'messages':
        // Requirements: 10.1, 10.2, 10.4 - Display conversations with unread messages
        return <MessagesScreen messages={realConversations} selectedIndex={selectedIndex} displayNameMap={displayNameMap} />;
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
            pendingRequestsCount={realFriendRequests.length}
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
            requests={realFriendRequests}
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
      case 'games':
        return <GamesMenuScreen selectedIndex={selectedIndex} />;
      case 'snakeGame':
        return (
          <SnakeGameScreen
            ref={snakeGameRef}
            onGameOver={handleSnakeGameOver}
            soundEnabled={soundEnabled}
            vibrateEnabled={vibrateEnabled}
          />
        );
      case 'snakeLeaderboard':
        return <SnakeLeaderboardScreen scores={snakeLeaderboard} />;
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
