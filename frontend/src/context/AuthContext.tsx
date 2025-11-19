/**
 * Auth Context - Manage user authentication state
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerForPushNotifications } from '../services/notificationService';
import { registerUser } from '../services/apiClient';
import {
  saveUserCredentials,
  getUserCredentials,
  clearUserCredentials,
  isUserRegistered,
} from '../services/storageService';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  hexCode: string | null;
  authToken: string | null;
  register: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hexCode, setHexCode] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Check if user is already registered on app start
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const registered = await isUserRegistered();
      
      if (registered) {
        const credentials = await getUserCredentials();
        setUserId(credentials.userId);
        setHexCode(credentials.hexCode);
        setAuthToken(credentials.authToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function register() {
    try {
      setIsLoading(true);

      // Request notification permissions and get device token
      const deviceToken = await registerForPushNotifications();

      if (!deviceToken) {
        throw new Error('Failed to get device token');
      }

      console.log('📱 Got device token, registering with backend...');

      // Register with backend
      const response = await registerUser(deviceToken);

      console.log('✅ Registered:', response.hexCode);

      // Save credentials
      await saveUserCredentials(
        response.userId,
        response.hexCode,
        response.token,
        deviceToken
      );

      // Update state
      setUserId(response.userId);
      setHexCode(response.hexCode);
      setAuthToken(response.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
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
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
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
        register,
        logout,
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
