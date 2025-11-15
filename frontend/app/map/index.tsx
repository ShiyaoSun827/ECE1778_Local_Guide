import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { ScreenContainer, LoadingSpinner } from '../../components';
import { usePlaces } from '../../hooks';
import { Place } from '../../types';
import { colors, spacing } from '../../theme';

export default function MapScreen() {
  const router = useRouter();
  const { places, loading } = usePlaces();
  const [region, setRegion] = useState({
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

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
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
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/add')}
        >
          <Text style={styles.buttonText}>+ Add Place</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  map: {
    flex: 1,
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

