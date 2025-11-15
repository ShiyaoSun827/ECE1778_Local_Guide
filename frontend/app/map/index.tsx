import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ScreenContainer, LoadingSpinner } from '../../components';
import { usePlaces } from '../../hooks';
import { Place } from '../../types';
import { colors, spacing } from '../../theme';

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
    router.push(`/places/${place.id}`);
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
            description={place.description}
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
});

