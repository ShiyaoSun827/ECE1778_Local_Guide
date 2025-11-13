import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../theme";

export interface PlaceCardProps {
  title: string;
  description?: string;
  thumbnailUri?: string | null;
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function PlaceCard({
  title,
  description,
  thumbnailUri,
  isFavorite = false,
  onPress,
  onFavoritePress,
  accessibilityLabel,
  accessibilityHint,
}: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.warn("Image load error:", error.nativeEvent.error);
    setImageError(true);
  };

  const cardAccessibilityLabel =
    accessibilityLabel || `${title}${description ? `. ${description}` : ""}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={cardAccessibilityLabel}
      accessibilityHint={accessibilityHint || "Double tap to view details"}
    >
      {thumbnailUri && !imageError ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.image}
          onError={handleImageError}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="location" size={24} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {onFavoritePress && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onFavoritePress();
              }}
              style={styles.favoriteButton}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
              accessibilityState={{ selected: isFavorite }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? colors.error : colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
        {description ? (
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.background,
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: spacing.m,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: typography.title,
    fontWeight: "600",
    color: colors.text,
  },
  favoriteButton: {
    padding: spacing.xs,
    marginLeft: spacing.s,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: typography.text,
    color: colors.textSecondary,
  },
});
