// frontend/app/(tabs)/favorites.tsx
import React, { useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ScreenContainer,
  PlaceCard,
  EmptyState,
  LoadingSpinner,
} from "../../components";
import { colors, spacing } from "../../theme";
import { authClient } from "../../lib/authClient";
import { usePlaces } from "../../hooks";

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { getFavorites, toggleFavorite } = usePlaces();

  // 从 Context 获取数据，数据现在来自于后端数据库 + 本地缓存的合并
  const favorites = useMemo(() => getFavorites(), [getFavorites]);

  const handlePlacePress = (id: string) => {
    router.push(`/places/${id}`);
  };

  const handleAddPress = () => {
    if (!session?.user) {
      Alert.alert("Sign in required", "Please sign in to add places.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/signin") },
      ]);
      return;
    }
    router.push("/add");
  };

  if (isPending) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  // Guest Mode
  if (!session?.user) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Sign in to view favorites"
          message="Create an account or sign in to save places as favorites."
        />
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/signin")}
        >
          <Text style={styles.signInText}>Go to Sign In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  // Logged in but empty
  if (favorites.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          title="No favorites yet"
          message="Star places to add them to your favorites!"
        />
        <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favorites.map((item) => (
          <PlaceCard
            key={item.id}
            place={item}
            onPress={() => handlePlacePress(item.id)}
            // 直接调用 Context 的 toggleFavorite，它内部现在处理了 API 请求
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingTop: -spacing.md,
    paddingBottom: spacing.xxl,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 32,
    color: colors.surface,
    fontWeight: "300",
  },
  signInButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignSelf: "center",
  },
  signInText: {
    color: colors.surface,
    fontWeight: "bold",
  },
});