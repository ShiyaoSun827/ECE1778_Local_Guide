// frontend/components/PostCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadows } from "../theme";
import { formatDistance } from "../utils/distance";

const { width } = Dimensions.get("window");

interface PostCardProps {
  place: any;
  userLocation?: { latitude: number; longitude: number } | null;
  onPress: () => void;
}

export function PostCard({ place, userLocation, onPress }: PostCardProps) {
  // 计算距离
  const distance = userLocation
    ? formatDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.latitude,
        place.longitude
      )
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* 1. 大图区域 */}
      <Image
        source={{ uri: place.imageUri || "https://via.placeholder.com/400x300" }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* 距离 Badge */}
      {distance && (
        <View style={styles.distanceBadge}>
          <Ionicons name="navigate" size={12} color="#fff" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* 2. 标题和地点 */}
        <Text style={styles.title} numberOfLines={1}>{place.title}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.address} numberOfLines={1}>
            {place.address || "Unknown Location"}
          </Text>
        </View>

        {/* 3. 用户信息栏 */}
        <View style={styles.footer}>
          <View style={styles.userRow}>
            <Image
              source={{ uri: place.user?.image || "https://ui-avatars.com/api/?name=User" }}
              style={styles.avatar}
            />
            <Text style={styles.userName} numberOfLines={1}>
              {place.user?.name || "Anonymous"}
            </Text>
          </View>
          
          {/* 预留点赞按钮 */}
          <TouchableOpacity style={styles.likeButton}>
             <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: spacing.lg,
    ...shadows.medium,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  likeButton: {
    padding: 4,
  }
});