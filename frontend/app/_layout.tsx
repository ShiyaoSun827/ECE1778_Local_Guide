// frontend/app/_layout.tsx
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PlacesProvider } from "../context/PlacesContext";
import { useNotifications } from "../hooks/useNotifications";


import { Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { authClient } from "../lib/authClient";

// Header auth button: when not signed in -> navigate to sign-in; when signed in -> navigate to favorites
function HeaderAuthButton() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const handlePress = () => {
    if (!user) {
      // Not signed in: navigate to sign-in page, which also provides a "sign up" button
      router.push("/signin");
    } else {
      // Signed in: directly view your Favorites (read from backend by user)
      router.push("/favorites/index");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ marginRight: 12 }}
      disabled={isPending}
    >
      <FontAwesome
        // When signed in, show solid user icon; when not signed in, show outline user icon
        name={user ? "user-circle" : "user-o"}
        size={22}
        color="#fff"
      />
    </Pressable>
  );
}

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
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          // 👇 All pages have a user icon button in the top right corner
          headerRight: () => <HeaderAuthButton />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Local Guide",
          }}
        />
        <Stack.Screen
          name="map/index"
          options={{
            title: "Map View",
          }}
        />
        <Stack.Screen
          name="add/index"
          options={{
            title: "Add Place",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="places/[id]"
          options={{
            title: "Place Details",
          }}
        />
        <Stack.Screen
          name="favorites/index"
          options={{
            title: "Favorites",
          }}
        />
        {/* Add sign-in / sign-up pages to the navigation stack */}
        <Stack.Screen
          name="signin"
          options={{
            title: "Sign In",
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: "Sign Up",
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
