import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ImageErrorEventData,
  NativeSyntheticEvent,
  ViewStyle,
  ImageStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

export interface ThumbnailProps {
  uri: string | null;
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
  accessibilityLabel?: string;
  testID?: string;
}

export default function Thumbnail({
  uri,
  size = 70,
  style,
  imageStyle,
  placeholderIcon = "image-outline",
  onError,
  accessibilityLabel,
  testID,
}: ThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when URI changes
  useEffect(() => {
    if (uri) {
      setImageError(false);
    }
  }, [uri]);

  const handleError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.warn("Thumbnail image load error:", error.nativeEvent.error);
    setImageError(true);
    onError?.(error);
  };

  const borderRadius = size / 8;
  const iconSize = Math.max(16, Math.min(size / 2, 32));

  if (!uri || imageError) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel || "Image placeholder"}
        testID={testID}
      >
        <Ionicons name={placeholderIcon} size={iconSize} color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        { width: size, height: size, borderRadius },
        imageStyle,
      ]}
      onError={handleError}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || "Place thumbnail"}
      accessibilityIgnoresInvertColors
      testID={testID}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    backgroundColor: colors.border,
  },
});

