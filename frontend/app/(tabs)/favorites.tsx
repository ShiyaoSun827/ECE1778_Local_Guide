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
import { apiFetch } from "../../lib/apiClient"; // ✅ 新增：带 Cookie 的 fetch

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { getFavorites, toggleFavorite } = usePlaces();

  // 从全局状态里拿当前收藏列表
  const favorites = useMemo(() => getFavorites(), [getFavorites]);

  // ✅ 新增：统一处理“收藏/取消收藏” + 打后端接口
  const handleToggleFavorite = async (id: string) => {
    if (!session?.user) {
      // 理论上不会走到这里，因为下面已经对未登录做了提前 return
      Alert.alert("Sign in required", "Please sign in to manage favorites.", [
        { text: "OK" },
      ]);
      return;
    }

    const isFavorite = favorites.some((p) => p.id === id);

    try {
      if (isFavorite) {
        // 取消收藏 -> DELETE /api/favorites?placeId=...
        await apiFetch(`/api/favorites?placeId=${id}`, {
          method: "DELETE",
        });
      } else {
        // 新增收藏 -> POST /api/favorites
        await apiFetch("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ placeId: id }),
        });
      }

      // 本地状态仍然用原来的 toggleFavorite 更新
      toggleFavorite(id);
    } catch (err) {
      console.error("[FavoritesScreen] toggle favorite error:", err);
      Alert.alert(
        "Error",
        "Failed to sync favorites with the server. Please try again."
      );
    }
  };

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

  // Not logged in: guest mode
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

  // Logged in but no favorites
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

  // Logged in + has favorites
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
            // ✅ 改这里：从直接用 toggleFavorite 换成调用我们新的 handler
            onToggleFavorite={() => handleToggleFavorite(item.id)}
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
  list: {
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
