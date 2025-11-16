// frontend/app/add/index.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as Location from 'expo-location';
import { ScreenContainer, TextField, Button, PhotoPicker } from '../../components';
import { usePlaces, useLocationPermission, usePhotoPicker } from '../../hooks';
import { PlaceFormData } from '../../types';
import { validation, spacing, colors, typography } from '../../theme';
// ✅ 新增：引入 authClient，用来区分游客 / 登录用户
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

  // ✅ 新增：当前登录状态（游客 / 已登录用户）
  const { data: session } = authClient.useSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PlaceFormData>({
    defaultValues: {
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      imageUri: undefined,
    },
  });

  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  // Pre-fill coordinates if passed from map
  useEffect(() => {
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude);
      const lon = parseFloat(params.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        setValue('latitude', lat);
        setValue('longitude', lon);
        if (params.address) {
          setAddress(params.address);
        }
      }
    }
  }, [params, setValue]);

  const handleUseCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setValue('latitude', currentLocation.coords.latitude);
      setValue('longitude', currentLocation.coords.longitude);
      setAddress(''); // Clear address when using current location
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

    // ✅ 核心改动：这里先判断有没有登录（有 session = 登录用户，没 session = 游客）
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
