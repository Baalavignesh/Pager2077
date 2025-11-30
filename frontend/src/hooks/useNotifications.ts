/**
 * useNotifications Hook - Manage push notifications
 */
import { useEffect, useRef } from 'react';
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
}

export function useNotifications({
  onNotificationReceived,
  onNotificationTapped,
}: UseNotificationsProps = {}) {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        console.log('✅ Registered for push notifications');
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      const data = getNotificationData(notification);
      if (data && onNotificationReceived) {
        onNotificationReceived(data);
      }
    });

    // Listen for user tapping on notification
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('👆 Notification tapped:', response);
      const data = getNotificationData(response.notification);
      if (data && onNotificationTapped) {
        onNotificationTapped(data);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onNotificationReceived, onNotificationTapped]);
}
