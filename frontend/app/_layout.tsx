// frontend/app/_layout.tsx
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PlacesProvider } from "../context/PlacesContext";
import { useNotifications } from "../hooks/useNotifications";
import { authClient } from "../lib/authClient";

function AppContent() {
  const { scheduleDailyReminder } = useNotifications();

  useEffect(() => {
    scheduleDailyReminder();
  }, [scheduleDailyReminder]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#007AFF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Back",
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
          name="signin"
          options={{
            title: "Sign In",
            presentation: "modal", 
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: "Sign Up",
            presentation: "modal",
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