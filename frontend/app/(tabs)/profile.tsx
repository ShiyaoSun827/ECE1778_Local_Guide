// frontend/app/(tabs)/profile.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "../../lib/authClient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme"; // 确保路径正确

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session, isLoading, error } = authClient.useSession();
  const user = session?.user;

  // 简单的登录检查：如果没有 Session 且不在加载中，跳转登录
  useEffect(() => {
    if (!isLoading && !session) {
      // 可以在这里跳转，或者显示一个“请登录”的 UI
      // router.replace("/signin");
    }
  }, [isLoading, session, router]);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authClient.signOut();
            router.replace("/signin");
          } catch (err: any) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Edit profile functionality will be implemented later.");
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 未登录状态 UI
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        <Text style={styles.guestText}>Guest User</Text>
        <Text style={styles.guestSubText}>Log in to manage your profile and places.</Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => router.push("/signin")}
        >
          <Text style={styles.loginButtonText}>Sign In / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部背景 */}
      <View style={styles.headerBackground} />

      {/* 个人信息卡片 */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{
              uri: user.image || "https://ui-avatars.com/api/?name=" + (user.name || "User") + "&background=0D8ABC&color=fff",
            }}
          />
          <TouchableOpacity style={styles.editIconBadge} onPress={handleEditProfile}>
             <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user.name || "Local Explorer"}</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        {/* 新增的字段展示 */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{(user as any).location || "Toronto, Canada"}</Text>
        </View>
        
        <Text style={styles.bio}>
          {(user as any).bio || "This user hasn't written a bio yet. They are busy exploring the world!"}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>
      </View>

      {/* 菜单选项 */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Account Settings</Text>
        
        <MenuItem 
          icon="settings-outline" 
          label="Preferences" 
          onPress={() => {}} 
        />
        <MenuItem 
          icon="notifications-outline" 
          label="Notifications" 
          onPress={() => {}} 
        />
        <MenuItem 
          icon="shield-checkmark-outline" 
          label="Privacy & Security" 
          onPress={() => {}} 
        />
        
        <Text style={[styles.menuTitle, { marginTop: 20 }]}>Support</Text>
        <MenuItem 
          icon="help-circle-outline" 
          label="Help Center" 
          onPress={() => {}} 
        />
        <MenuItem 
          icon="log-out-outline" 
          label="Sign Out" 
          onPress={handleLogout}
          isDestructive
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

// 辅助组件：菜单项
const MenuItem = ({ icon, label, onPress, isDestructive = false }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconBox, isDestructive && styles.destructiveIconBox]}>
      <Ionicons name={icon} size={22} color={isDestructive ? "#EF4444" : "#333"} />
    </View>
    <Text style={[styles.menuLabel, isDestructive && styles.destructiveLabel]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  headerBackground: {
    height: 140,
    backgroundColor: "#007AFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileCard: {
    marginTop: -70,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
  },
  bio: {
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e2e8f0",
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destructiveIconBox: {
    backgroundColor: "#FEF2F2",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  destructiveLabel: {
    color: "#EF4444",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  versionText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  guestText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  guestSubText: {
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});