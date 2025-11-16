//frontend/components/PlaceCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Place } from '../types';
import { colors, spacing, typography, shadows } from '../theme';
import { formatDate } from '../utils';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onPress,
  onToggleFavorite,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {place.imageUri ? (
          <Image source={{ uri: place.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={styles.deleteButton}
            accessibilityLabel="Delete place"
            accessibilityHint="Double tap to delete this place"
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
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={styles.favoriteButton}
            >
              <Text style={styles.favoriteIcon}>
                {place.isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {place.description && (
          <Text style={styles.description} numberOfLines={2}>
            {place.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.meta}>
            {place.visitCount} {place.visitCount === 1 ? 'visit' : 'visits'}
          </Text>
          <Text style={styles.meta}>{formatDate(place.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  deleteIcon: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 20,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 24,
    color: colors.favorite,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

