//frontend/app/places/[id].tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { ScreenContainer, WeatherWidget, Button, LoadingSpinner } from '../../components';
import { usePlaces, useWeather } from '../../hooks';
import { Place } from '../../types';
import { colors, spacing, typography } from '../../theme';
import { formatDate, formatDistance } from '../../utils';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getPlace,
    fetchPlaceDetails,
    deletePlace,
    toggleFavorite,
    incrementVisitCount,
  } = usePlaces();
  const cachedPlace = id ? getPlace(id) : undefined;
  const [place, setPlace] = useState<Place | null>(cachedPlace ?? null);
  const [loadingPlace, setLoadingPlace] = useState(!cachedPlace);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastIncrementedId = useRef<string | null>(null);

  const { weather, loading: weatherLoading } = useWeather(
    place?.latitude,
    place?.longitude
  );

  useEffect(() => {
    if (cachedPlace) {
      setPlace(cachedPlace);
      setLoadingPlace(false);
      setLoadError(null);
    }
  }, [cachedPlace]);

  useEffect(() => {
    let isMounted = true;
    if (!id || cachedPlace) return;

    setLoadingPlace(true);
    fetchPlaceDetails(id)
      .then((result) => {
        if (!isMounted) return;
        setPlace(result ?? null);
        if (!result) {
          setLoadError("We couldn't find details for this place.");
        }
      })
      .catch((err) => {
        console.error("Failed to load place details:", err);
        if (isMounted) {
          setLoadError("Failed to load place details.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingPlace(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, cachedPlace, fetchPlaceDetails]);

  useEffect(() => {
    if (
      id &&
      place &&
      place.source === "custom" &&
      lastIncrementedId.current !== id
    ) {
      incrementVisitCount(place.id);
      lastIncrementedId.current = id;
    }
  }, [id, place, incrementVisitCount]);

  const isCustomPlace = place?.source === "custom";

  const openExternalLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) =>
      console.warn("Unable to open link:", err)
    );
  };

  const handleOpenMaps = () => openExternalLink(place?.googleMapsUri);
  const handleOpenWebsite = () => openExternalLink(place?.websiteUri);
  const handleDial = () => {
    if (!place?.phoneNumber) return;
    const sanitized = place.phoneNumber.replace(/\s+/g, "");
    openExternalLink(`tel:${sanitized}`);
  };

  if (loadingPlace) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  if (!place) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {loadError ?? "Place not found"}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  const handleDelete = () => {
    if (!isCustomPlace) return;
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
          {place.address && (
            <Text style={styles.address}>{place.address}</Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              Added {formatDate(place.createdAt)} • {place.visitCount}{' '}
              {place.visitCount === 1 ? 'visit' : 'visits'}
            </Text>
            {typeof place.distanceKm === 'number' && (
              <Text style={styles.meta}>🛣️ {formatDistance(place.distanceKm)}</Text>
            )}
          </View>
          <View style={styles.chipRow}>
            {place.rating && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>⭐ {place.rating.toFixed(1)}</Text>
                {place.ratingCount ? (
                  <Text style={styles.chipMeta}> ({place.ratingCount})</Text>
                ) : null}
              </View>
            )}
            {place.openNow !== null && place.openNow !== undefined && (
              <View style={[styles.chip, place.openNow ? styles.openChip : styles.closedChip]}>
                <Text style={styles.chipText}>
                  {place.openNow ? 'Open now' : 'Closed'}
                </Text>
              </View>
            )}
            {place.category && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{place.category}</Text>
              </View>
            )}
          </View>
        </View>

        {place.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{place.description}</Text>
          </View>
        )}

        {(place.address || place.phoneNumber || place.websiteUri) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {place.address && (
              <Text style={styles.sectionItem}>📍 {place.address}</Text>
            )}
            {place.phoneNumber && (
              <TouchableOpacity onPress={handleDial}>
                <Text style={styles.linkText}>📞 {place.phoneNumber}</Text>
              </TouchableOpacity>
            )}
            {place.websiteUri && (
              <TouchableOpacity onPress={handleOpenWebsite}>
                <Text style={styles.linkText}>🔗 Visit website</Text>
              </TouchableOpacity>
            )}
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

        {(place.googleMapsUri ||
          place.websiteUri ||
          place.phoneNumber ||
          isCustomPlace) && (
          <View style={styles.actions}>
            {place.googleMapsUri && (
              <Button
                title="Open in Google Maps"
                onPress={handleOpenMaps}
                style={styles.actionButton}
              />
            )}
            {place.websiteUri && (
              <Button
                title="Visit Website"
                onPress={handleOpenWebsite}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            {place.phoneNumber && (
              <Button
                title={`Call ${place.phoneNumber}`}
                onPress={handleDial}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            {isCustomPlace && (
              <Button
                title="Delete Place"
                onPress={handleDelete}
                variant="outline"
                style={{ ...styles.actionButton, borderColor: colors.error }}
                textStyle={{ color: colors.error }}
              />
            )}
          </View>
        )}
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
  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  chipMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  openChip: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  closedChip: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
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
  sectionItem: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  linkText: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: spacing.xs,
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
    gap: spacing.sm,
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

