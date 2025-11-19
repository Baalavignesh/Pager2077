/**
 * Notification Service - Handle push notifications on iOS
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'VOICE_NOTE' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'FRIEND_STATUS';
  voiceNoteId?: string;
  requestId?: string;
  senderId?: string;
  senderHexCode?: string;
  friendHexCode?: string;
  status?: 'online' | 'offline';
}

/**
 * Register for push notifications and get device token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  console.log('🔔 Starting push notification registration...');
  
  // Only works on physical devices (or iOS 16+ simulator)
  if (!Device.isDevice && Platform.OS !== 'ios') {
    console.log('⚠️  Push notifications require a physical device or iOS simulator');
    return null;
  }

  console.log('✅ Running on physical device');

  // Check existing permissions
  console.log('🔍 Checking existing permissions...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('   Existing status:', existingStatus);
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    console.log('📋 Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('   Permission result:', status);
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Push notification permission denied');
    return null;
  }

  console.log('✅ Notification permissions granted');

  // Get device push token (APNS token for iOS)
  try {
    console.log('🔑 Getting device push token from APNS...');
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData.data;
    console.log('✅ Got APNS device token:', token);
    console.log('📤 Returning token to caller...');
    return token;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    console.error('⚠️  Build the app with Xcode to enable push notifications.');
    console.error('⚠️  See LOCAL_BUILD_GUIDE.md for instructions.');
    return null;
  }
}

/**
 * Add listener for notifications received while app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification responses (user tapped notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Set badge count on app icon
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get notification data from notification object
 */
export function getNotificationData(
  notification: Notifications.Notification
): NotificationData | null {
  return notification.request.content.data as NotificationData;
}
