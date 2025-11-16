import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ScreenContainer, LoadingSpinner, Button } from '../../components';
import { usePlaces } from '../../hooks';
import { Place } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';
import { formatDate } from '../../utils';

export default function MapScreen() {
  const router = useRouter();
  const { places, loading } = usePlaces();
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
  const [reverseGeocodingLoading, setReverseGeocodingLoading] = useState(false);

  useEffect(() => {
    if (places.length > 0) {
      // Calculate center of all places
      const avgLat =
        places.reduce((sum, p) => sum + p.latitude, 0) / places.length;
      const avgLon =
        places.reduce((sum, p) => sum + p.longitude, 0) / places.length;

      // Calculate bounds
      const lats = places.map((p) => p.latitude);
      const lons = places.map((p) => p.longitude);
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
  }, [places]);

  const handleMarkerPress = (place: Place) => {
    setSelectedPlace(place);
    setClickedLocation(null);
    setShowPlaceModal(true);
  };

  const handleMapPress = async (event: any) => {
    // Don't trigger if clicking on a marker (markers handle their own press events)
    // The onPress event fires for map taps, not marker taps
    const { latitude, longitude } = event.nativeEvent.coordinate;
      
      // Check if this is one of our saved places
      const existingPlace = places.find(
        (p) =>
          Math.abs(p.latitude - latitude) < 0.0001 &&
          Math.abs(p.longitude - longitude) < 0.0001
      );

      if (existingPlace) {
        // If it's a saved place, show it normally
        handleMarkerPress(existingPlace);
        return;
      }

      // Otherwise, reverse geocode the clicked location
      try {
        setReverseGeocodingLoading(true);
        setClickedLocation({ latitude, longitude });
        
        // Try to get address for this location
        const reverseGeocodeResult = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocodeResult && reverseGeocodeResult.length > 0) {
          const address = reverseGeocodeResult[0];
          // Format address
          const addressParts = [
            address.street,
            address.city,
            address.region,
            address.country,
          ].filter(Boolean);
          const formattedAddress = addressParts.join(', ') || 'Unknown location';
          
          setClickedLocation({
            latitude,
            longitude,
            address: formattedAddress,
          });
        } else {
          setClickedLocation({
            latitude,
            longitude,
            address: undefined,
          });
        }
        
        setShowPlaceModal(true);
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setClickedLocation({
          latitude,
          longitude,
          address: undefined,
        });
        setShowPlaceModal(true);
      } finally {
        setReverseGeocodingLoading(false);
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

  if (loading) {
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
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.description || 'Tap to view details'}
            onPress={() => handleMarkerPress(place)}
          />
        ))}
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

      {/* Add Place Button */}
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
            {(selectedPlace || clickedLocation) && (
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
                    {/* Place Image */}
                    {selectedPlace.imageUri && (
                      <Image
                        source={{ uri: selectedPlace.imageUri }}
                        style={styles.modalImage}
                      />
                    )}

                    {/* Place Info */}
                    <ScrollView 
                      style={styles.modalInfo}
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                        <Text style={styles.favoriteIcon}>
                          {selectedPlace.isFavorite ? '★' : '☆'}
                        </Text>
                      </View>

                      {selectedPlace.description && (
                        <Text style={styles.modalDescription}>
                          {selectedPlace.description}
                        </Text>
                      )}

                      <View style={styles.modalMeta}>
                        <Text style={styles.modalMetaText}>
                          📍 {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}
                        </Text>
                        <Text style={styles.modalMetaText}>
                          👁️ {selectedPlace.visitCount} {selectedPlace.visitCount === 1 ? 'visit' : 'visits'}
                        </Text>
                        <Text style={styles.modalMetaText}>
                          📅 {formatDate(selectedPlace.createdAt)}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.modalActions}>
                        <Button
                          title="View Details"
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
                      {reverseGeocodingLoading ? (
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
                          </View>
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
  modalActions: {
    marginTop: spacing.sm,
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

