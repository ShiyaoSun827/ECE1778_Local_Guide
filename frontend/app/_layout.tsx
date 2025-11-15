import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PlacesProvider } from '../context/PlacesContext';
import { useNotifications } from '../hooks/useNotifications';

function AppContent() {
  const { scheduleDailyReminder } = useNotifications();

  useEffect(() => {
    // Schedule daily exploration reminders on app start
    scheduleDailyReminder();
  }, [scheduleDailyReminder]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Local Guide',
          }}
        />
        <Stack.Screen
          name="map/index"
          options={{
            title: 'Map View',
          }}
        />
        <Stack.Screen
          name="add/index"
          options={{
            title: 'Add Place',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="places/[id]"
          options={{
            title: 'Place Details',
          }}
        />
        <Stack.Screen
          name="favorites/index"
          options={{
            title: 'Favorites',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <PlacesProvider>
      <AppContent />
    </PlacesProvider>
  );
}

