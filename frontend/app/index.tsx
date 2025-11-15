import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, PlaceCard, EmptyState, LoadingSpinner } from '../components';
import { usePlaces } from '../hooks';
import { colors, spacing } from '../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { places, loading, toggleFavorite } = usePlaces();

  const handlePlacePress = (id: string) => {
    router.push(`/places/${id}`);
  };

  const handleAddPress = () => {
    router.push('/add');
  };

  const renderPlace = ({ item }: { item: any }) => (
    <PlaceCard
      place={item}
      onPress={() => handlePlacePress(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
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
    <ScreenContainer>
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

      {places.length === 0 ? (
        <EmptyState
          title="No places yet"
          message="Add your first place to get started!"
        />
      ) : (
        <FlatList
          data={places}
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
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mapButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  favoritesButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  favoritesButtonText: {
    color: colors.surface,
    fontWeight: '600',
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

