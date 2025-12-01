/**
 * useNotifications Hook - Manage push notifications
 * Requirements: 8.3, 8.4 - Handle message notifications and navigate to chat on tap
 */
import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getNotificationData,
  type NotificationData,
} from '../services/notificationService';

interface UseNotificationsProps {
  onNotificationReceived?: (data: NotificationData) => void;
  onNotificationTapped?: (data: NotificationData) => void;
  onMessageReceived?: (data: { senderId?: string; senderName?: string; messageId?: string }) => void;
  onMessageTapped?: (data: { senderId?: string; senderName?: string; messageId?: string }) => void;
}

export function useNotifications({
  onNotificationReceived,
  onNotificationTapped,
  onMessageReceived,
  onMessageTapped,
}: UseNotificationsProps = {}) {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Handle notification received while app is in foreground
  // Requirements: 8.3 - Display notification banner with sender and message preview
  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    console.log('📬 Notification received:', notification);
    const data = getNotificationData(notification);
    
    if (!data) {
      return;
    }

    // Handle message notifications specifically
    // Requirements: 8.3 - Handle message notification type
    if (data.type === 'MESSAGE' || data.type === 'LIVE_ACTIVITY_START') {
      console.log('📟 Message notification received:', {
        senderId: data.senderId,
        senderName: data.senderName,
        messageId: data.messageId,
      });
      
      if (onMessageReceived) {
        onMessageReceived({
          senderId: data.senderId,
          senderName: data.senderName,
          messageId: data.messageId,
        });
      }
    }

    // Call generic handler
    if (onNotificationReceived) {
      onNotificationReceived(data);
    }
  }, [onNotificationReceived, onMessageReceived]);

  // Handle notification tapped by user
  // Requirements: 8.4 - Navigate to chat on notification tap
  const handleNotificationTapped = useCallback((response: Notifications.NotificationResponse) => {
    console.log('👆 Notification tapped:', response);
    const data = getNotificationData(response.notification);
    
    if (!data) {
      return;
    }

    // Handle message notification tap - navigate to chat
    // Requirements: 8.4 - Navigate to chat with that friend
    if (data.type === 'MESSAGE' || data.type === 'LIVE_ACTIVITY_START') {
      console.log('📟 Message notification tapped, navigating to chat:', {
        senderId: data.senderId,
        senderName: data.senderName,
        messageId: data.messageId,
      });
      
      if (onMessageTapped) {
        onMessageTapped({
          senderId: data.senderId,
          senderName: data.senderName,
          messageId: data.messageId,
        });
      }
    }

    // Call generic handler
    if (onNotificationTapped) {
      onNotificationTapped(data);
    }
  }, [onNotificationTapped, onMessageTapped]);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        console.log('✅ Registered for push notifications');
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(handleNotificationReceived);

    // Listen for user tapping on notification
    responseListener.current = addNotificationResponseListener(handleNotificationTapped);

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [handleNotificationReceived, handleNotificationTapped]);
}
