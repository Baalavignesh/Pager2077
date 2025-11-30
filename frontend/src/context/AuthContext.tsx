/**
 * Auth Context - Manage user authentication state
 * Requirements: 11.1, 12.1, 12.3 - Display name management
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerForPushNotifications } from '../services/notificationService';
import { registerUser, updateDisplayName as apiUpdateDisplayName } from '../services/apiClient';
import {
  saveUserCredentials,
  getUserCredentials,
  clearUserCredentials,
  isUserRegistered,
  saveDisplayName as storeSaveDisplayName,
} from '../services/storageService';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  hexCode: string | null;
  authToken: string | null;
  displayName: string | null;
  register: (displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hexCode, setHexCode] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Check if user is already registered on app start
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      console.log('🔍 Checking if user is already registered...');
      const registered = await isUserRegistered();
      
      if (registered) {
        console.log('✅ User already registered, loading credentials...');
        const credentials = await getUserCredentials();
        console.log('📋 Loaded credentials:');
        console.log('   User ID:', credentials.userId);
        console.log('   Hex Code:', credentials.hexCode);
        console.log('   Has Auth Token:', !!credentials.authToken);
        console.log('   Has Device Token:', !!credentials.deviceToken);
        console.log('   Display Name:', credentials.displayName || '(not set)');
        
        setUserId(credentials.userId);
        setHexCode(credentials.hexCode);
        setAuthToken(credentials.authToken);
        setDisplayName(credentials.displayName);
        setIsAuthenticated(true);
        
        console.log('✅ User authenticated from stored credentials');
      } else {
        console.log('❌ No stored credentials found - need to register');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function register(initialDisplayName?: string) {
    try {
      setIsLoading(true);

      console.log('🔔 Requesting push notification permissions...');

      // Request notification permissions and get device token
      const deviceToken = await registerForPushNotifications();

      if (!deviceToken) {
        throw new Error('Failed to get device token');
      }

      console.log('✅ Got APNS device token:', deviceToken);
      console.log('📱 Registering with backend...');

      // Register with backend
      const response = await registerUser(deviceToken);

      console.log('🎉 Registration complete!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 REGISTRATION DETAILS:');
      console.log('   User ID:', response.userId);
      console.log('   Hex Code:', response.hexCode);
      console.log('   Auth Token:', response.token);
      console.log('   Device Token:', deviceToken);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // If display name provided, save it to backend immediately after registration
      let savedDisplayName: string | null = null;
      if (initialDisplayName) {
        console.log('📝 Saving display name to backend...');
        try {
          const displayNameResponse = await apiUpdateDisplayName(response.token, initialDisplayName);
          savedDisplayName = displayNameResponse.displayName;
          console.log('✅ Display name saved:', savedDisplayName);
        } catch (error) {
          console.error('⚠️ Failed to save display name, continuing with registration:', error);
          // Don't fail registration if display name save fails
        }
      }

      // Save credentials (including display name if set)
      await saveUserCredentials(
        response.userId,
        response.hexCode,
        response.token,
        deviceToken,
        savedDisplayName
      );

      // Also save display name separately for the hasDisplayName check
      if (savedDisplayName) {
        await storeSaveDisplayName(savedDisplayName);
      }

      console.log('💾 Credentials saved to secure storage');

      // Update state
      setUserId(response.userId);
      setHexCode(response.hexCode);
      setAuthToken(response.token);
      setDisplayName(savedDisplayName);
      setIsAuthenticated(true);

      console.log('✅ Auth state updated - user is now authenticated');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await clearUserCredentials();
      setUserId(null);
      setHexCode(null);
      setAuthToken(null);
      setDisplayName(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Update user display name
   * Requirements: 11.1, 12.1, 12.3 - Send display name to backend and update local state
   */
  async function updateDisplayName(name: string): Promise<void> {
    console.log('🔍 AuthContext.updateDisplayName called');
    console.log('   authToken:', authToken ? 'present' : 'missing');
    
    if (!authToken) {
      console.error('❌ No auth token available');
      throw new Error('Not authenticated');
    }

    try {
      console.log('📝 Updating display name to:', name);
      
      // Send to backend
      const response = await apiUpdateDisplayName(authToken, name);
      
      console.log('✅ Backend updated display name:', response.displayName);
      
      // Store in secure storage
      await storeSaveDisplayName(name);
      
      console.log('💾 Display name saved to secure storage');
      
      // Update local state
      setDisplayName(response.displayName);
      
      console.log('✅ Display name state updated');
    } catch (error) {
      console.error('❌ Failed to update display name:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        userId,
        hexCode,
        authToken,
        displayName,
        register,
        logout,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
