// frontend/app/_layout.tsx
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PlacesProvider } from "../context/PlacesContext";
import { useNotifications } from "../hooks/useNotifications";

import { TouchableOpacity, Alert, StyleSheet, Text } from "react-native";
import { authClient } from "../lib/authClient";

// Top-right user button:
// 1) Not logged in: navigate to /signin
// 2) Logged in: show confirmation dialog to sign out, then signOut + show success message
function HeaderAuthButton() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isLoggedIn = !!user;

  const handlePress = () => {
    if (!isLoggedIn) {
      // Not logged in: navigate to sign in page (which has a "Sign Up" button)
      router.push("/signin");
    } else {
      // Logged in: show confirmation dialog
      Alert.alert(
        "Sign out",
        "Do you want to sign out?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign out",
            style: "destructive",
            onPress: async () => {
              try {
                await authClient.signOut();
                Alert.alert("Success", "You have been signed out.");
                // If you want to force redirect to home page after logout, you can add:
                // router.replace("/");
              } catch (err: any) {
                console.log("Logout error:", err);
                Alert.alert("Error", err?.message ?? "Logout failed");
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.button}
      disabled={isPending}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText} numberOfLines={1}>
        {isLoggedIn ? "Logout" : "Login"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
    paddingLeft: 12,
    paddingRight: 0,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "flex-end",
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    textAlignVertical: "center",
  },
});

function AppContent() {
  const { scheduleDailyReminder } = useNotifications();

  useEffect(() => {
    // Schedule daily reminder when app starts
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
          // All pages use HeaderAuthButton in the top-right corner
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
        {/* Sign in / Sign up pages */}
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
