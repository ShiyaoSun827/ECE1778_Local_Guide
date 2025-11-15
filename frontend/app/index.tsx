import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, PlaceCard, EmptyState, LoadingSpinner } from '../components';
import { usePlaces } from '../hooks';
import { colors, spacing, typography } from '../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { places, loading, toggleFavorite, deletePlace } = usePlaces();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter places based on search query
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) {
      return places;
    }

    const query = searchQuery.toLowerCase().trim();
    return places.filter((place) => {
      const nameMatch = place.name.toLowerCase().includes(query);
      const descriptionMatch = place.description?.toLowerCase().includes(query) || false;
      const categoryMatch = place.category?.toLowerCase().includes(query) || false;
      return nameMatch || descriptionMatch || categoryMatch;
    });
  }, [places, searchQuery]);

  const handlePlacePress = (id: string) => {
    router.push(`/places/${id}`);
  };

  const handleAddPress = () => {
    router.push('/add');
  };

  const handleDeletePlace = (id: string, name: string) => {
    Alert.alert(
      'Delete Place',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlace(id);
          },
        },
      ]
    );
  };

  const renderPlace = ({ item }: { item: any }) => (
    <PlaceCard
      place={item}
      onPress={() => handlePlacePress(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onDelete={() => handleDeletePlace(item.id, item.name)}
    />
  );

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/map')}
        >
          <Text style={styles.mapButtonText}>🗺️ Map View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoritesButton}
          onPress={() => router.push('/favorites')}
        >
          <Text style={styles.favoritesButtonText}>⭐ Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {places.length > 0 && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {places.length === 0 ? (
        <EmptyState
          title="No places yet"
          message="Add your first place to get started!"
        />
      ) : filteredPlaces.length === 0 ? (
        <EmptyState
          title="No places found"
          message={`No places found matching "${searchQuery}"`}
        />
      ) : (
        <FlatList
          data={filteredPlaces}
          renderItem={renderPlace}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No places yet"
              message="Add your first place to get started!"
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: -spacing.xl,
  },
  mapButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  mapButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  favoritesButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  favoritesButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
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
    paddingRight: 40,
    color: colors.text,
    minHeight: 48,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.sm,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 32,
    color: colors.surface,
    fontWeight: '300',
  },
});

