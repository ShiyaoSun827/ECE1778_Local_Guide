// frontend/app/_layout.tsx
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PlacesProvider } from "../context/PlacesContext";
import { useNotifications } from "../hooks/useNotifications";

import { Pressable, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { authClient } from "../lib/authClient";

// 右上角用户按钮：
// 1）未登录：跳转到 /signin
// 2）已登录：弹窗确认是否退出登录，确认后 signOut + 提示成功
function HeaderAuthButton() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isLoggedIn = !!user;

  const handlePress = () => {
    if (!isLoggedIn) {
      // 未登录：进入登录页（登录页里有“注册”按钮）
      router.push("/signin");
    } else {
      // 已登录：弹出确认框
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
                // 如果你希望登出后强制回首页，可以再加：
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
    <Pressable
      onPress={handlePress}
      style={{ marginRight: 12 }}
      disabled={isPending}
    >
      <FontAwesome
        // 已登录：实心头像；未登录：空心头像
        name={isLoggedIn ? "user-circle" : "user-o"}
        size={22}
        color="#fff"
      />
    </Pressable>
  );
}

function AppContent() {
  const { scheduleDailyReminder } = useNotifications();

  useEffect(() => {
    // App 启动时安排每日提醒
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
          // 所有页面右上角统一使用 HeaderAuthButton
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
        {/* 登录 / 注册页 */}
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
