//frontend/app/(tabs)/map.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image, Modal, ScrollView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ScreenContainer, LoadingSpinner, Button } from '../../components';
import { usePlaces } from '../../hooks';
import { Place } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';
import { formatDate, formatDistance } from '../../utils';
import { searchNearbyPlaces } from '../../services/googlePlacesService';

export default function MapScreen() {
  const router = useRouter();
  const {
    places,
    discoverPlaces,
    searchResults,
    discoverLoading,
    loading,
  } = usePlaces();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 43.6532,
    longitude: -79.3832,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const [nearbyRecommendations, setNearbyRecommendations] = useState<Place[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  const googlePlaces = searchResults.length > 0 ? searchResults : discoverPlaces;

  const combinedPlaces = useMemo(() => {
    const byId = new Map<string, Place>();
    googlePlaces.forEach((place) => {
      byId.set(place.id, place);
    });
    places.forEach((place) => {
      if (!byId.has(place.id)) {
        byId.set(place.id, place);
      }
    });
    return Array.from(byId.values());
  }, [googlePlaces, places]);

  useEffect(() => {
    if (combinedPlaces.length > 0) {
      const avgLat =
        combinedPlaces.reduce((sum, p) => sum + p.latitude, 0) /
        combinedPlaces.length;
      const avgLon =
        combinedPlaces.reduce((sum, p) => sum + p.longitude, 0) /
        combinedPlaces.length;

      const lats = combinedPlaces.map((p) => p.latitude);
      const lons = combinedPlaces.map((p) => p.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      setRegion({
        latitude: avgLat,
        longitude: avgLon,
        latitudeDelta: Math.max(maxLat - minLat, 0.01) * 1.5,
        longitudeDelta: Math.max(maxLon - minLon, 0.01) * 1.5,
      });
    }
  }, [combinedPlaces]);

  useEffect(() => {
    if (!showPlaceModal) {
      setNearbyRecommendations([]);
      setNearbyError(null);
    }
  }, [showPlaceModal]);

  const handleMarkerPress = (place: Place) => {
    setSelectedPlace(place);
    setClickedLocation(null);
    setNearbyRecommendations([]);
    setNearbyError(null);
    setShowPlaceModal(true);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const existingPlace = combinedPlaces.find(
      (p) =>
        Math.abs(p.latitude - latitude) < 0.0001 &&
        Math.abs(p.longitude - longitude) < 0.0001
    );

    if (existingPlace) {
      handleMarkerPress(existingPlace);
      return;
    }

    setSelectedPlace(null);
    setNearbyRecommendations([]);
    setNearbyError(null);
    setClickedLocation({ latitude, longitude });
    setAddressLookupLoading(true);
    setShowPlaceModal(true);

    try {
      const nearby = await searchNearbyPlaces({
        latitude,
        longitude,
        radius: 120,
        maxResultCount: 1,
      });
      if (nearby && nearby.length > 0) {
        const candidate = nearby[0];
        setClickedLocation((prev) =>
          prev
            ? {
                ...prev,
                address: candidate.address || candidate.name || "Pinned location",
              }
            : {
                latitude,
                longitude,
                address: candidate.address || candidate.name || "Pinned location",
              }
        );
      }
    } catch (error) {
      console.error("Address lookup error:", error);
    } finally {
      setAddressLookupLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (selectedPlace) {
      setShowPlaceModal(false);
      router.push(`/places/${selectedPlace.id}`);
    }
  };

  const handleCloseModal = () => {
    setShowPlaceModal(false);
    setSelectedPlace(null);
    setClickedLocation(null);
    setNearbyRecommendations([]);
    setNearbyError(null);
  };

  const handleAddToMyPlaces = () => {
    if (clickedLocation) {
      setShowPlaceModal(false);
      // Navigate to add place screen with pre-filled coordinates
      router.push({
        pathname: '/add',
        params: {
          latitude: clickedLocation.latitude.toString(),
          longitude: clickedLocation.longitude.toString(),
          address: clickedLocation.address || '',
        },
      });
    }
  };

  const safeOpenUrl = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) =>
      console.warn("Unable to open link:", err)
    );
  };

  const handleOpenMaps = (url?: string) => safeOpenUrl(url);

  const handleOpenWebsite = (url?: string) => safeOpenUrl(url);

  const handleDial = (phone?: string) => {
    if (!phone) return;
    const sanitized = phone.replace(/\s+/g, "");
    safeOpenUrl(`tel:${sanitized}`);
  };

  const resolveTargetLocation = () => {
    if (selectedPlace) {
      return {
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        address: selectedPlace.address ?? selectedPlace.name ?? "Pinned place",
      };
    }
    if (clickedLocation) {
      return clickedLocation;
    }
    return {
      latitude: region.latitude,
      longitude: region.longitude,
      address: "Map center",
    };
  };

  const handleSearchNearby = async () => {
    const target = resolveTargetLocation();
    setNearbyLoading(true);
    setNearbyError(null);
    try {
      const results = await searchNearbyPlaces({
        latitude: target.latitude,
        longitude: target.longitude,
        radius: 1500,
        maxResultCount: 8,
      });
      const limited = results.slice(0, 6);
      setNearbyRecommendations(limited);
      setSelectedPlace(null);
      setClickedLocation(target);
      setShowPlaceModal(true);
    } catch (err) {
      console.error("Nearby search error:", err);
      setNearbyError(
        err instanceof Error
          ? err.message
          : "Unable to load nearby recommendations."
      );
      setShowPlaceModal(true);
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleLocateMe = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (location && mapRef.current) {
        const newRegion: Region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current.animateToRegion(newRegion, 1000);
        setRegion(newRegion);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newRegion: Region = {
        ...region,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const newRegion: Region = {
        ...region,
        latitudeDelta: Math.min(region.latitudeDelta * 2, 180),
        longitudeDelta: Math.min(region.longitudeDelta * 2, 360),
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const showInitialLoader =
    combinedPlaces.length === 0 && (discoverLoading || loading);

  if (showInitialLoader) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {combinedPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.description || 'Tap to view details'}
            onPress={() => handleMarkerPress(place)}
            pinColor={place.source === 'custom' ? colors.secondary : colors.primary}
          />
        ))}
        {clickedLocation && (
          <Marker
            coordinate={{
              latitude: clickedLocation.latitude,
              longitude: clickedLocation.longitude,
            }}
            title={clickedLocation.address || "Pinned location"}
            pinColor={colors.secondary}
          />
        )}
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={handleLocateMe}
        accessibilityLabel="Locate me"
        accessibilityHint="Moves the map to your current location"
      >
        <Text style={styles.locateButtonIcon}>📍</Text>
      </TouchableOpacity>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomButton, styles.zoomInButton]}
          onPress={handleZoomIn}
          accessibilityLabel="Zoom in"
          accessibilityHint="Zooms in on the map"
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, styles.zoomOutButton]}
          onPress={handleZoomOut}
          accessibilityLabel="Zoom out"
          accessibilityHint="Zooms out on the map"
        >
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/add')}
        >
          <Text style={styles.buttonText}>+ Add Place</Text>
        </TouchableOpacity>
      </View>

      {/* Place Info Modal */}
      <Modal
        visible={showPlaceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <SafeAreaView edges={['bottom']} style={styles.modalSafeArea}>
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
            {(selectedPlace || clickedLocation || nearbyRecommendations.length > 0) && (
              <>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {selectedPlace ? (
                  <>
                    {selectedPlace.imageUri && (
                      <Image
                        source={{ uri: selectedPlace.imageUri }}
                        style={styles.modalImage}
                      />
                    )}

                    <ScrollView
                      style={styles.modalInfo}
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.modalHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalTitle}>
                            {selectedPlace.name}
                          </Text>
                          {selectedPlace.address && (
                            <Text style={styles.modalAddress}>
                              {selectedPlace.address}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.favoriteIcon}>
                          {selectedPlace.isFavorite ? "★" : "☆"}
                        </Text>
                      </View>

                      <View style={styles.modalMeta}>
                        {selectedPlace.rating && (
                          <Text style={styles.modalMetaText}>
                            ⭐ {selectedPlace.rating.toFixed(1)}
                            {selectedPlace.ratingCount
                              ? ` (${selectedPlace.ratingCount})`
                              : ""}
                          </Text>
                        )}
                        {selectedPlace.openNow !== null &&
                          selectedPlace.openNow !== undefined && (
                            <Text
                              style={[
                                styles.modalMetaText,
                                selectedPlace.openNow
                                  ? styles.openText
                                  : styles.closedText,
                              ]}
                            >
                              {selectedPlace.openNow ? "Open now" : "Closed"}
                            </Text>
                          )}
                        {typeof selectedPlace.distanceKm === "number" && (
                          <Text style={styles.modalMetaText}>
                            🛣️ {formatDistance(selectedPlace.distanceKm)}
                          </Text>
                        )}
                        <Text style={styles.modalMetaText}>
                          📍 {selectedPlace.latitude.toFixed(4)},{" "}
                          {selectedPlace.longitude.toFixed(4)}
                        </Text>
                        <Text style={styles.modalMetaText}>
                          📅 {formatDate(selectedPlace.createdAt)}
                        </Text>
                      </View>

                      {selectedPlace.description && (
                        <Text style={styles.modalDescription}>
                          {selectedPlace.description}
                        </Text>
                      )}

                      <View style={styles.modalActions}>
                        <Button
                          title="View details"
                          onPress={handleViewDetails}
                          style={styles.detailsButton}
                        />
                      </View>
                    </ScrollView>
                  </>
                ) : clickedLocation ? (
                  <>
                    {/* Clicked Location Info */}
                    <ScrollView 
                      style={styles.modalInfo}
                      showsVerticalScrollIndicator={false}
                    >
                      {addressLookupLoading ? (
                        <View style={styles.loadingContainer}>
                          <LoadingSpinner />
                          <Text style={styles.loadingText}>Loading location info...</Text>
                        </View>
                      ) : (
                        <>
                          <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                              {clickedLocation.address || 'Location'}
                            </Text>
                          </View>

                          <View style={styles.modalMeta}>
                            <Text style={styles.modalMetaText}>
                              📍 Latitude: {clickedLocation.latitude.toFixed(6)}
                            </Text>
                            <Text style={styles.modalMetaText}>
                              📍 Longitude: {clickedLocation.longitude.toFixed(6)}
                            </Text>
                            {clickedLocation.address && (
                              <Text style={styles.modalMetaText}>
                                🏠 {clickedLocation.address}
                              </Text>
                            )}
                          </View>

                          {/* Action Buttons */}
                          <View style={styles.modalActions}>
                            <Button
                              title="Add to My Places"
                              onPress={handleAddToMyPlaces}
                              style={styles.detailsButton}
                            />
                            <Button
                              title={nearbyLoading ? "Searching..." : "Search Nearby"}
                              onPress={handleSearchNearby}
                              style={styles.detailsButton}
                              disabled={nearbyLoading}
                            />
                          </View>

                          {nearbyLoading ? (
                            <View style={styles.nearbyLoading}>
                              <LoadingSpinner />
                              <Text style={styles.nearbyLoadingText}>
                                Finding recommendations...
                              </Text>
                            </View>
                          ) : nearbyRecommendations.length > 0 ? (
                            <View style={styles.nearbySection}>
                              <Text style={styles.sectionSubtitle}>
                                Nearby recommendations
                              </Text>
                              {nearbyRecommendations.map((place) => (
                                <TouchableOpacity
                                  key={place.id}
                                  style={styles.nearbyItem}
                                  onPress={() => {
                                    setNearbyRecommendations([]);
                                    handleMarkerPress(place);
                                  }}
                                >
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.nearbyItemTitle}>
                                      {place.name}
                                    </Text>
                                    {place.address && (
                                      <Text style={styles.nearbyItemSubtitle}>
                                        {place.address}
                                      </Text>
                                    )}
                                  </View>
                                  {typeof place.distanceKm === 'number' && (
                                    <Text style={styles.nearbyItemDistance}>
                                      {formatDistance(place.distanceKm)}
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : nearbyError ? (
                            <Text style={styles.nearbyError}>{nearbyError}</Text>
                          ) : null}
                        </>
                      )}
                    </ScrollView>
                  </>
                ) : null}
              </>
            )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locateButtonIcon: {
    fontSize: 24,
  },
  zoomControls: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    marginTop: 56,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  zoomInButton: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  zoomOutButton: {
    // No border needed
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.text,
    lineHeight: 28,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSafeArea: {
    maxHeight: '75%',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '100%',
    ...shadows.large,
    zIndex: 1001,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '300',
  },
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  modalInfo: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  modalAddress: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 24,
    color: colors.favorite,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  modalMeta: {
    marginBottom: spacing.md,
  },
  modalMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  openText: {
    color: colors.success,
    fontWeight: '600',
  },
  closedText: {
    color: colors.error,
    fontWeight: '600',
  },
  modalActions: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  nearbySection: {
    marginTop: spacing.md,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nearbyItemTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  nearbyItemSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  nearbyItemDistance: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  nearbyLoading: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  nearbyLoadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  nearbyError: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  detailsButton: {
    width: '100%',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

