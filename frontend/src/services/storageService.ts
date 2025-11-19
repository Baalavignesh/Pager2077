/**
 * Storage Service - Secure storage for user credentials
 */
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  USER_ID: 'userId',
  HEX_CODE: 'hexCode',
  AUTH_TOKEN: 'authToken',
  DEVICE_TOKEN: 'deviceToken',
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
