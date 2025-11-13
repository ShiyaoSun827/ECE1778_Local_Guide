import React, { useState } from "react";
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Text,
  ImageErrorEventData,
  NativeSyntheticEvent,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePhotoPicker } from "../hooks/usePhotoPicker";
import { colors, spacing, typography } from "../theme";

export interface PhotoPickerProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
  accessibilityLabel?: string;
}

export default function PhotoPicker({
  value,
  onChange,
  label,
  accessibilityLabel,
}: PhotoPickerProps) {
  const { pickImage, takePhoto, loading } = usePhotoPicker();
  const [imageError, setImageError] = useState(false);

  const handleImageError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.warn("Image load error:", error.nativeEvent.error);
    setImageError(true);
  };

  const handleRemove = () => {
    onChange(null);
    setImageError(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.optionsContainer}>
        <Pressable
          style={[styles.option, value && styles.optionSelected]}
          onPress={async () => {
            const uri = await pickImage();
            if (uri) {
              onChange(uri);
              setImageError(false);
            }
          }}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || "Select photo from gallery"}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="images-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Gallery</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.option, value && styles.optionSelected]}
          onPress={async () => {
            const uri = await takePhoto();
            if (uri) {
              onChange(uri);
              setImageError(false);
            }
          }}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Take photo with camera"
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Camera</Text>
            </>
          )}
        </Pressable>
      </View>

      {value && !imageError && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: value }}
            style={styles.previewImage}
            onError={handleImageError}
            accessibilityIgnoresInvertColors
          />
          <Pressable
            style={styles.removeButton}
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
          >
            <Ionicons name="close-circle" size={24} color={colors.error} />
          </Pressable>
        </View>
      )}

      {value && imageError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
          <Pressable onPress={handleRemove} style={styles.retryButton}>
            <Text style={styles.retryText}>Remove</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.l,
  },
  label: {
    marginBottom: spacing.s,
    fontSize: typography.label,
    fontWeight: "500",
    color: colors.text,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.m,
  },
  option: {
    flex: 1,
    height: 100,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    borderStyle: "solid",
    backgroundColor: `${colors.primary}10`,
  },
  optionText: {
    marginTop: spacing.xs,
    fontSize: typography.text,
    color: colors.primary,
    fontWeight: "500",
  },
  previewContainer: {
    marginTop: spacing.m,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.xs,
  },
  errorContainer: {
    marginTop: spacing.m,
    padding: spacing.m,
    backgroundColor: `${colors.error}10`,
    borderRadius: 10,
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: typography.text,
    marginBottom: spacing.xs,
  },
  retryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
  },
  retryText: {
    color: colors.error,
    fontSize: typography.text,
    fontWeight: "600",
  },
});
