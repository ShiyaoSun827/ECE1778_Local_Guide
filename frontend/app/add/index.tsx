// frontend/app/add/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as Location from 'expo-location';
import { ScreenContainer, TextField, Button, PhotoPicker } from '../../components';
import { usePlaces, useLocationPermission, usePhotoPicker } from '../../hooks';
import { PlaceFormData } from '../../types';
import { validation, spacing, colors, typography } from '../../theme';
// Import authClient to distinguish between guest and logged-in users
import { authClient } from '../../lib/authClient';

export default function AddPlaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    address?: string;
  }>();
  const { addPlace } = usePlaces();
  const { getCurrentLocation } = useLocationPermission();
  const { imageUri, pickImage, takePhoto, clearImage } = usePhotoPicker();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  
  // Use ref to track if parameters have been set to avoid infinite loop from repeated updates
  const lastParamsRef = useRef<string>('');

  // Get current session state (guest or logged-in user)
  const { data: session } = authClient.useSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PlaceFormData>({
    defaultValues: {
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      imageUri: undefined,
    },
  });

  // Pre-fill coordinates if passed from map
  // Fix: Use specific parameter values as dependencies and use ref to avoid infinite loop from repeated updates
  useEffect(() => {
    if (!params.latitude || !params.longitude) {
      return;
    }

    const paramsKey = `${params.latitude}_${params.longitude}_${params.address || ''}`;
    
    // Skip if parameters haven't changed to avoid repeated updates
    if (paramsKey === lastParamsRef.current) {
      return;
    }

    const lat = parseFloat(params.latitude);
    const lon = parseFloat(params.longitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      // Set values with shouldValidate: false to avoid triggering validation and re-renders
      setValue('latitude', lat, { shouldValidate: false, shouldDirty: false });
      setValue('longitude', lon, { shouldValidate: false, shouldDirty: false });
      if (params.address) {
        setAddress(params.address);
      }
      // Record the set parameters to avoid repeated updates
      lastParamsRef.current = paramsKey;
    }
    // Only depend on specific parameter values, not setValue (it's stable) or watch values (to avoid loop)
  }, [params.latitude, params.longitude, params.address, setValue]);

  const handleUseCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setValue('latitude', currentLocation.coords.latitude);
      setValue('longitude', currentLocation.coords.longitude);
      setAddress(''); // Clear address when using current location
      Alert.alert('Success', 'Updated to current location');
    } else {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    try {
      setGeocodingLoading(true);
      const geocodeResult = await Location.geocodeAsync(address);
      
      if (geocodeResult && geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        // Show success message with coordinates
        Alert.alert(
          'Success',
          `Location found:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`
        );
      } else {
        Alert.alert(
          'Error',
          'Could not find location for this address. Please try a more specific address.'
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Error',
        'Failed to geocode address. Please check your internet connection and try again.'
      );
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setValue('imageUri', uri);
    }
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setValue('imageUri', uri);
    }
  };

  const handleRemoveImage = () => {
    clearImage();
    setValue('imageUri', undefined);
  };

  const onSubmit = async (data: PlaceFormData) => {
    if (!data.latitude || !data.longitude) {
      Alert.alert('Error', 'Please set location coordinates');
      return;
    }

    // Core change: Check if user is logged in (has session = logged-in user, no session = guest)
    if (!session?.user) {
      Alert.alert(
        'Sign in required',
        'Please sign in to add a new place.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Sign In',
            onPress: () => router.push('/signin'),
          },
        ]
      );
      return;
    }

    try {
      setLoading(true);
      await addPlace({
        ...data,
        imageUri: imageUri || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add place');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          rules={validation.name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Name"
              placeholder="Enter place name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
          name="name"
        />

        <Controller
          control={control}
          rules={validation.description}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Description"
              placeholder="Enter description (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              error={errors.description?.message}
            />
          )}
          name="description"
        />

        <PhotoPicker
          imageUri={imageUri || undefined}
          onPickImage={handlePickImage}
          onTakePhoto={handleTakePhoto}
          onRemove={handleRemoveImage}
        />

        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Location Settings</Text>
          
          <Button
            title="Use Current Location"
            onPress={handleUseCurrentLocation}
            variant="outline"
            style={styles.locationButton}
          />

          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Or Enter Address</Text>
            <TextField
              label="Address"
              placeholder="e.g., 123 Main Street, New York, NY"
              value={address}
              onChangeText={setAddress}
              style={styles.addressInput}
            />
            <Button
              title="Search Address"
              onPress={handleGeocodeAddress}
              loading={geocodingLoading}
              variant="outline"
              style={styles.geocodeButton}
            />
          </View>

          <View style={styles.coordinatesSection}>
            <Text style={styles.coordinatesLabel}>Or Enter Coordinates</Text>
            <Controller
              control={control}
              rules={validation.latitude}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Latitude"
                  placeholder="Enter latitude"
                  value={value.toString()}
                  onChangeText={(text) => {
                    onChange(parseFloat(text) || 0);
                    // Clear address when manually entering coordinates
                    if (text.trim()) {
                      setAddress('');
                    }
                  }}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  error={errors.latitude?.message}
                />
              )}
              name="latitude"
            />

            <Controller
              control={control}
              rules={validation.longitude}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Longitude"
                  placeholder="Enter longitude"
                  value={value.toString()}
                  onChangeText={(text) => {
                    onChange(parseFloat(text) || 0);
                    // Clear address when manually entering coordinates
                    if (text.trim()) {
                      setAddress('');
                    }
                  }}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  error={errors.longitude?.message}
                />
              )}
              name="longitude"
            />
          </View>
        </View>

        <Button
          title="Add Place"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  locationSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  locationButton: {
    marginBottom: spacing.md,
  },
  addressSection: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  addressInput: {
    marginBottom: spacing.sm,
  },
  geocodeButton: {
    marginTop: spacing.xs,
  },
  coordinatesSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coordinatesLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
