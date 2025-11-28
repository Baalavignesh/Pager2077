/**
 * Storage Service - Secure storage for user credentials
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_ID: 'userId',
  HEX_CODE: 'hexCode',
  AUTH_TOKEN: 'authToken',
  DEVICE_TOKEN: 'deviceToken',
  DISPLAY_NAME: 'displayName',
  DISPLAY_NAME_MAPPINGS: 'displayNameMappings',
};

/**
 * Save user credentials after registration
 */
export async function saveUserCredentials(
  userId: string,
  hexCode: string,
  authToken: string,
  deviceToken: string
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.USER_ID, userId),
    SecureStore.setItemAsync(KEYS.HEX_CODE, hexCode),
    SecureStore.setItemAsync(KEYS.AUTH_TOKEN, authToken),
    SecureStore.setItemAsync(KEYS.DEVICE_TOKEN, deviceToken),
  ]);
}

/**
 * Get stored user credentials
 */
export async function getUserCredentials(): Promise<{
  userId: string | null;
  hexCode: string | null;
  authToken: string | null;
  deviceToken: string | null;
}> {
  const [userId, hexCode, authToken, deviceToken] = await Promise.all([
    SecureStore.getItemAsync(KEYS.USER_ID),
    SecureStore.getItemAsync(KEYS.HEX_CODE),
    SecureStore.getItemAsync(KEYS.AUTH_TOKEN),
    SecureStore.getItemAsync(KEYS.DEVICE_TOKEN),
  ]);

  return { userId, hexCode, authToken, deviceToken };
}

/**
 * Clear all stored credentials (logout)
 */
export async function clearUserCredentials(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.USER_ID),
    SecureStore.deleteItemAsync(KEYS.HEX_CODE),
    SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
    SecureStore.deleteItemAsync(KEYS.DEVICE_TOKEN),
  ]);
}

/**
 * Check if user is registered
 */
export async function isUserRegistered(): Promise<boolean> {
  const authToken = await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
  return authToken !== null;
}

/**
 * Save current user's display name to Secure Storage
 */
export async function saveDisplayName(displayName: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.DISPLAY_NAME, displayName);
}

/**
 * Get current user's display name from Secure Storage
 */
export async function getDisplayName(): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS.DISPLAY_NAME);
}

/**
 * Save all display name mappings to AsyncStorage
 */
export async function saveAllDisplayNameMappings(
  mappings: Record<string, string>
): Promise<void> {
  await AsyncStorage.setItem(
    KEYS.DISPLAY_NAME_MAPPINGS,
    JSON.stringify(mappings)
  );
}

/**
 * Get all display name mappings from AsyncStorage
 */
export async function getAllDisplayNameMappings(): Promise<Record<string, string>> {
  try {
    const json = await AsyncStorage.getItem(KEYS.DISPLAY_NAME_MAPPINGS);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('Failed to load display name mappings:', error);
    return {};
  }
}

/**
 * Check if user has set a display name
 */
export async function hasDisplayName(): Promise<boolean> {
  const displayName = await getDisplayName();
  return displayName !== null && displayName.length > 0;
}
