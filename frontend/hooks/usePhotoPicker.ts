import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export interface UsePhotoPickerReturn {
  pickImage: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function usePhotoPicker(): UsePhotoPickerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library."
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to pick image";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera."
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to take photo";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { pickImage, takePhoto, loading, error };
}
