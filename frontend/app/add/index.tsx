import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { ScreenContainer, TextField, Button, PhotoPicker } from '../../components';
import { usePlaces, useLocationPermission, usePhotoPicker } from '../../hooks';
import { PlaceFormData } from '../../types';
import { validation, spacing } from '../../theme';

export default function AddPlaceScreen() {
  const router = useRouter();
  const { addPlace } = usePlaces();
  const { getCurrentLocation } = useLocationPermission();
  const { imageUri, pickImage, takePhoto, clearImage } = usePhotoPicker();
  const [loading, setLoading] = useState(false);

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

  const handleUseCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setValue('latitude', currentLocation.coords.latitude);
      setValue('longitude', currentLocation.coords.longitude);
    } else {
      Alert.alert('Error', 'Could not get current location');
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
          <Button
            title="Use Current Location"
            onPress={handleUseCurrentLocation}
            variant="outline"
            style={styles.locationButton}
          />

          <Controller
            control={control}
            rules={validation.latitude}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Latitude"
                placeholder="Enter latitude"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
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
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                onBlur={onBlur}
                keyboardType="numeric"
                error={errors.longitude?.message}
              />
            )}
            name="longitude"
          />
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
  locationButton: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});

