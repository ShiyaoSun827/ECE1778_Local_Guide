/**
 * Hook for managing Expo Notifications
 * Sends exploration reminders to encourage users to visit places
 */
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request permissions
    registerForPushNotificationsAsync();

    // Listen for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    // Listen for user tapping on notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
      });

    return () => {
      // In Expo Go, removeNotificationSubscription may not be available
      if (typeof Notifications.removeNotificationSubscription === 'function') {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } else {
        // In Expo Go, subscriptions are automatically cleaned up
        // Just clear the refs
        notificationListener.current = undefined;
        responseListener.current = undefined;
      }
    };
  }, []);

  /**
   * Schedule a daily exploration reminder
   */
  const scheduleDailyReminder = async () => {
    try {
      // Cancel any existing reminders
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily reminder at 10 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌍 Time to Explore!',
          body: 'Discover new places or revisit your favorites today!',
          sound: true,
          data: { type: 'exploration_reminder' },
        },
        trigger: {
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Daily exploration reminder scheduled');
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  };

  /**
   * Schedule a reminder for a specific place
   */
  const schedulePlaceReminder = async (
    placeName: string,
    hoursFromNow: number = 24
  ) => {
    try {
      const trigger = new Date();
      trigger.setHours(trigger.getHours() + hoursFromNow);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 Visit ${placeName}`,
          body: `Don't forget to check out ${placeName}!`,
          sound: true,
          data: { type: 'place_reminder', placeName },
        },
        trigger,
      });

      console.log(`Reminder scheduled for ${placeName}`);
    } catch (error) {
      console.error('Error scheduling place reminder:', error);
    }
  };

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All reminders cancelled');
    } catch (error) {
      console.error('Error cancelling reminders:', error);
    }
  };

  return {
    scheduleDailyReminder,
    schedulePlaceReminder,
    cancelAllReminders,
  };
}

/**
 * Register for push notifications and request permissions
 */
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  try {
    // Try to get push token, but it requires projectId in app.json
    // For local notifications, this is optional
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  } catch (error) {
    // If projectId is not configured, that's okay - local notifications still work
    console.log('Push token not available (projectId not configured). Local notifications will still work.');
  }

  return token;
}

