//frontend/components/PlaceCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from "react-native";
import { Place } from "../types";
import { colors, spacing, typography, shadows } from "../theme";
import { formatDistance } from "../utils";

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onPress,
  onToggleFavorite,
  onDelete,
  style,
}) => {
  const distanceLabel =
    typeof place.distanceKm === "number"
      ? formatDistance(place.distanceKm)
      : undefined;

  const ratingLabel =
    typeof place.rating === "number" ? place.rating.toFixed(1) : undefined;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        {place.imageUri ? (
          <Image source={{ uri: place.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🧭</Text>
          </View>
        )}

        <View style={styles.chipRow}>
          {place.openNow !== null && place.openNow !== undefined && (
            <View
              style={[
                styles.chip,
                place.openNow ? styles.openChip : styles.closedChip,
              ]}
            >
              <Text style={styles.chipText}>
                {place.openNow ? "Open now" : "Closed"}
              </Text>
            </View>
          )}
          {ratingLabel && (
            <View style={[styles.chip, styles.ratingChip]}>
              <Text style={styles.ratingText}>⭐ {ratingLabel}</Text>
              {place.ratingCount ? (
                <Text style={styles.ratingCount}> ({place.ratingCount})</Text>
              ) : null}
            </View>
          )}
        </View>

        {onToggleFavorite && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            style={styles.favoriteButton}
            accessibilityLabel="Toggle favorite"
          >
            <Text style={styles.favoriteIcon}>
              {place.isFavorite ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        )}

        {onDelete && place.source === "custom" && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={styles.deleteButton}
            accessibilityLabel="Delete place"
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          {place.category && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{place.category}</Text>
            </View>
          )}
        </View>

        {place.address && (
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        )}

        <View style={styles.metaRow}>
          {distanceLabel && (
            <Text style={styles.metaText}>📍 {distanceLabel}</Text>
          )}
          {place.priceLevel ? (
            <Text style={styles.metaText}>{"$".repeat(place.priceLevel)}</Text>
          ) : null}
        </View>

        {place.description && (
          <Text style={styles.description} numberOfLines={2}>
            {place.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: "hidden",
    ...shadows.medium,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    height: 210,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: "100%",
    height: 210,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 42,
  },
  chipRow: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  chipText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
  },
  openChip: {
    backgroundColor: "rgba(46, 204, 113, 0.85)",
  },
  closedChip: {
    backgroundColor: "rgba(231, 76, 60, 0.85)",
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  ratingText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
  },
  ratingCount: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.35)",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 22,
    color: colors.surface,
  },
  deleteButton: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  tagText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
});
