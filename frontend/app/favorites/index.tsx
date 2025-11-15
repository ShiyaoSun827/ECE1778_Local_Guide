import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, PlaceCard, EmptyState, LoadingSpinner } from '../../components';
import { usePlaces } from '../../hooks';
import { colors, spacing } from '../../theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { getFavorites, loading, toggleFavorite } = usePlaces();
  const favorites = getFavorites();

  const handlePlacePress = (id: string) => {
    router.push(`/places/${id}`);
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
      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Star places to add them to your favorites!"
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderPlace}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add')}
      >
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

