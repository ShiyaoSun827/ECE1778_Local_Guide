// frontend/app/profile.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "../lib/authClient";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session, isLoading } = authClient.useSession();

  // 如果没登录，自动踢回 /signin
  useEffect(() => {
    if (!isLoading && !session?.user) {
      router.replace("/signin");
    }
  }, [isLoading, session, router]);

  const user = session?.user;

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      // 清掉 session 后，跳回登录页
      router.replace("/signin");
    } catch (err: any) {
      console.log("Logout error:", err);
      Alert.alert("Error", err?.message ?? "Logout failed");
    }
  };

  // 加一个简单的“加载中”占位
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 顶部彩色背景 */}
      <View style={styles.header} />

      {/* 头像 */}
      <Image
        style={styles.avatar}
        source={{
          uri:
            user?.image ??
            "https://bootdey.com/img/Content/avatar/avatar6.png",
        }}
      />

      {/* 主要信息卡片 */}
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.name ?? "Local Guide User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.subtitle}>Local Guide Explorer</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>My Places</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
          </View>
        </View>

        {/* 功能按钮区 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Activity</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/places")}
          >
            <Text style={styles.actionText}>View My Places</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/favorites")}
          >
            <Text style={styles.actionText}>View Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* 设置 / 关于 区 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Edit Profile (coming soon)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Notification Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const HEADER_HEIGHT = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#4B7BE5",
    height: HEADER_HEIGHT,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "white",
    alignSelf: "center",
    marginTop: HEADER_HEIGHT - 60,
    marginBottom: 16,
    backgroundColor: "#ddd",
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B7BE5",
    marginTop: 8,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: "#334155",
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    color: "#B91C1C",
    fontWeight: "600",
    textAlign: "center",
  },
});
