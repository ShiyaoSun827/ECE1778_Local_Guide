import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Place } from '../types';
import { colors, spacing, typography, shadows } from '../theme';
import { formatDate } from '../utils';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onPress,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {place.imageUri && (
        <Image source={{ uri: place.imageUri }} style={styles.image} />
      )}
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
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
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

