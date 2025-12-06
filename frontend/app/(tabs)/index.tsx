//frontend/app/(tabs)/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ScreenContainer,
  PlaceCard,
  EmptyState,
  LoadingSpinner,
} from "../../components";
import { usePlaces } from "../../hooks";
import { colors, spacing, typography } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const {
    discoverPlaces,
    searchResults,
    places: myPlaces,
    discoverLoading,
    searchLoading,
    loading: placesLoading,
    toggleFavorite,
    deletePlace,
    categories,
    activeCategory,
    setActiveCategory,
    searchGooglePlaces,
    refreshDiscover,
    error,
    locationPermissionGranted,
    locationLoading,
  } = usePlaces();

  const [searchQuery, setSearchQuery] = useState("");
  const [heroMessage, setHeroMessage] = useState(
    "Discover local gems curated for you."
  );

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      searchGooglePlaces("");
      return;
    }
    if (trimmed.length < 3) {
      searchGooglePlaces(trimmed);
      return;
    }
    const timer = setTimeout(() => {
      searchGooglePlaces(trimmed);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchGooglePlaces]);

  const safeDiscoverPlaces = Array.isArray(discoverPlaces)
    ? discoverPlaces
    : [];
  const safeSearchResults = Array.isArray(searchResults)
    ? searchResults
    : [];

  const hasActiveSearch = searchQuery.trim().length > 0;
  const exploreList = hasActiveSearch ? safeSearchResults : safeDiscoverPlaces;
  const limitedExploreList = useMemo(
    () => (exploreList.length > 6 ? exploreList.slice(0, 6) : exploreList),
    [exploreList]
  );
  const isLoading = hasActiveSearch ? searchLoading : discoverLoading;

  useEffect(() => {
    if (locationLoading) {
      setHeroMessage("Locating you for tailored recommendations...");
      return;
    }
    if (locationPermissionGranted === false) {
      setHeroMessage("Enable location to unlock hyper-local highlights.");
      return;
    }
    if (error) {
      setHeroMessage(error);
      return;
    }
    if (safeDiscoverPlaces.length > 0) {
      setHeroMessage("Top picks nearby, refreshed in real time.");
      return;
    }
    setHeroMessage("Discover local gems curated for you.");
  }, [
    locationLoading,
    locationPermissionGranted,
    error,
    safeDiscoverPlaces.length,
  ]);

  const handlePlacePress = (id: string) => {
    router.push(`/places/${id}`);
  };

  const handleAddPress = () => {
    router.push("/add");
  };

  const handleDeletePlace = (id: string, name: string) => {
    Alert.alert(
      "Delete Place",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePlace(id);
          },
        },
      ]
    );
  };

  const renderPlaceCard = (place: any) => (
    <PlaceCard
      key={place.id}
      place={place}
      onPress={() => handlePlacePress(place.id)}
      onToggleFavorite={() => toggleFavorite(place.id)}
    />
  );

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Local Guide</Text>
          <Text style={styles.heroTitle}>Explore beautiful places</Text>
          <Text style={styles.heroSubtitle}>{heroMessage}</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroButtonPrimary}
              onPress={() => router.push("/map")}
            >
              <Text style={styles.heroButtonPrimaryText}>Open map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroButtonSecondary}
              onPress={() => router.push("/favorites")}
            >
              <Text style={styles.heroButtonSecondaryText}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by place, vibe, or keyword"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>



     

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              {hasActiveSearch ? "Search results" : "Discover nearby"}
            </Text>
            <Text style={styles.sectionTitle}>
              {hasActiveSearch ? "Inspired by your search" : "Handpicked gems"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => refreshDiscover({ force: true })}>
            <Text style={styles.sectionAction}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : limitedExploreList.length === 0 ? (
          <EmptyState
            title={hasActiveSearch ? "No matches found" : "Nothing nearby just yet"}
            message={
              hasActiveSearch
                ? "Try a different keyword or broaden your search."
                : "Try refreshing or enable location services."
            }
          />
        ) : (
          <View>
            {limitedExploreList.map(renderPlaceCard)}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
  },
  scrollContent: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingTop: -spacing.md,
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: "#101828",
    padding: spacing.xl,
    borderRadius: 24,
    marginBottom: spacing.lg,
  },
  heroEyebrow: {
    ...typography.caption,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.85)",
  },
  heroActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroButtonPrimary: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  heroButtonPrimaryText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  heroButtonSecondary: {
    flex: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroButtonSecondaryText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  searchContainer: {
    position: "relative",
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingLeft: spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xl,
    color: colors.text,
    minHeight: 52,
  },
  clearButton: {
    position: "absolute",
    right: spacing.sm,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "300",
  },
  categories: {
    marginBottom: spacing.lg,
  },
  categoryRow: {
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    ...typography.body,
    color: colors.text,
  },
  categoryTextActive: {
    color: colors.surface,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionEyebrow: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  sectionAction: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  errorBanner: {
    backgroundColor: "rgba(231, 76, 60, 0.15)",
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
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
});
