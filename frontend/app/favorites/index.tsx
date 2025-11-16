// frontend/app/favorites/index.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  ScreenContainer,
  PlaceCard,
  EmptyState,
  LoadingSpinner,
} from "../../components";
import { colors, spacing } from "../../theme";
import { authClient } from "../../lib/authClient";


const BACKEND_BASE_URL = "http://127.0.0.1:3000";

type FavoritePlace = {
  id: string;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
  try {
    setLoading(true);

    const cookies = authClient.getCookie();
    const res = await fetch(`${BACKEND_BASE_URL}/api/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookies ? { Cookie: cookies } : {}),
      },
    });

    if (res.status === 401) {
      setFavorites([]);
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend /api/favorites error text:", text);
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = (await res.json()) as FavoritePlace[];
    setFavorites(data ?? []);
  } catch (err: any) {
    console.error("Load favorites error:", err);
    Alert.alert("Error", err?.message ?? "Failed to load favorites");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (session?.user) {
      
      loadFavorites();
    } else if (!isPending) {
      setFavorites([]);
    }
  }, [session?.user?.id, isPending]);

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

  // 正在检查 session 或加载收藏
  if (isPending || loading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  // 没登录：游客模式
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

  // 已登录但没有收藏
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

  // 已登录 + 有收藏
  return (
    <ScreenContainer>
      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Star places to add them to your favorites!"
        />
      ) : (
        <>
          {favorites.map((item) => (
            <PlaceCard
              key={item.id}
              place={{
                id: item.id,
                name: item.name,
                description: item.description ?? "",
                latitude: item.latitude,
                longitude: item.longitude,
                imageUri: item.imageUrl ?? undefined,
                isFavorite: true,
              }}
              onPress={() => handlePlacePress(item.id)}
              onToggleFavorite={() => {
                
              }}
            />
          ))}
        </>
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
