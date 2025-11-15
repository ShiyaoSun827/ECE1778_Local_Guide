import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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
            title: 'My Places',
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

