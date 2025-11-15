import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { ScreenContainer, WeatherWidget, Button } from '../../components';
import { usePlaces, useWeather } from '../../hooks';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPlace, deletePlace, toggleFavorite, incrementVisitCount } = usePlaces();
  const place = getPlace(id);
  const lastIncrementedId = useRef<string | null>(null);

  const { weather, loading: weatherLoading } = useWeather(
    place?.latitude,
    place?.longitude
  );

  useEffect(() => {
    // Only increment visit count once per place when the details page is opened
    // Track which place ID we've already incremented to avoid duplicates
    if (id && place && lastIncrementedId.current !== id) {
      incrementVisitCount(place.id);
      lastIncrementedId.current = id;
    }
  }, [id, place, incrementVisitCount]);

  if (!place) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Place not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Place',
      'Are you sure you want to delete this place?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlace(place.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleToggleFavorite = () => {
    toggleFavorite(place.id);
  };

  return (
    <ScreenContainer scrollable>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {place.imageUri && (
          <Image source={{ uri: place.imageUri }} style={styles.image} />
        )}

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{place.name}</Text>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
              <Text style={styles.favoriteIcon}>
                {place.isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.meta}>
            Added {formatDate(place.createdAt)} • {place.visitCount}{' '}
            {place.visitCount === 1 ? 'visit' : 'visits'}
          </Text>
        </View>

        {place.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{place.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.coordinates}>
            {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
          </Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: place.latitude,
                longitude: place.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
              />
            </MapView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather</Text>
          <WeatherWidget weather={weather} loading={weatherLoading} />
        </View>

        <View style={styles.actions}>
          <Button
            title="Delete Place"
            onPress={handleDelete}
            variant="outline"
            style={[styles.actionButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.border,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 32,
    color: colors.favorite,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  coordinates: {
    ...typography.body,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: spacing.md,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  map: {
    flex: 1,
  },
  actions: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.lg,
  },
});

