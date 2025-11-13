import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../theme";
import { WeatherData } from "../types/weather";
import { getWeatherIcon } from "../utils/weather";

export interface WeatherWidgetProps {
  weatherData: WeatherData | null;
  loading?: boolean;
  error?: string | null;
  showDetails?: boolean; // Show humidity and wind speed
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export default function WeatherWidget({
  weatherData,
  loading = false,
  error = null,
  showDetails = false,
  accessibilityLabel,
  style,
}: WeatherWidgetProps) {
  const weatherIcon = useMemo(() => {
    if (!weatherData) return "partly-sunny-outline";
    return getWeatherIcon(weatherData.description, weatherData.icon);
  }, [weatherData]);

  const accessibilityText = useMemo(() => {
    if (loading) return "Loading weather data";
    if (error) return accessibilityLabel || "Weather data unavailable";
    if (!weatherData) return "";
    
    const details = [
      `Temperature: ${weatherData.temperature}°C`,
      `Description: ${weatherData.description}`,
    ];
    
    if (showDetails && weatherData.humidity !== undefined) {
      details.push(`Humidity: ${weatherData.humidity}%`);
    }
    
    if (showDetails && weatherData.windSpeed !== undefined) {
      details.push(`Wind speed: ${weatherData.windSpeed} km/h`);
    }
    
    return accessibilityLabel || `Weather: ${details.join(", ")}`;
  }, [loading, error, weatherData, showDetails, accessibilityLabel]);

  if (loading) {
    return (
      <View
        style={[styles.container, style]}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityText}
        accessibilityLiveRegion="polite"
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, styles.errorContainer, style]}
        accessibilityRole="alert"
        accessibilityLabel={accessibilityText}
        accessibilityLiveRegion="polite"
      >
        <Ionicons name="cloud-offline-outline" size={24} color={colors.error} />
        <Text style={styles.errorText}>
          {error || "Weather unavailable"}
        </Text>
      </View>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityText}
    >
      <Ionicons name={weatherIcon} size={28} color={colors.primary} />
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.temperature}>
            {Math.round(weatherData.temperature)}°C
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {weatherData.description}
          </Text>
        </View>
        
        {showDetails && (weatherData.humidity !== undefined || weatherData.windSpeed !== undefined) && (
          <View style={styles.details}>
            {weatherData.humidity !== undefined && (
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{weatherData.humidity}%</Text>
              </View>
            )}
            {weatherData.windSpeed !== undefined && (
              <View style={styles.detailItem}>
                <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{weatherData.windSpeed} km/h</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    marginVertical: spacing.s,
  },
  errorContainer: {
    backgroundColor: `${colors.error}10`,
  },
  content: {
    marginLeft: spacing.m,
    flex: 1,
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  temperature: {
    fontSize: typography.title,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: typography.text,
    color: colors.textSecondary,
    flex: 1,
    textTransform: "capitalize",
  },
  details: {
    flexDirection: "row",
    marginTop: spacing.xs,
    gap: spacing.m,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.error,
    color: colors.textSecondary,
  },
  loadingText: {
    marginLeft: spacing.s,
    fontSize: typography.text,
    color: colors.textSecondary,
  },
  errorText: {
    marginLeft: spacing.s,
    fontSize: typography.text,
    color: colors.error,
    flex: 1,
  },
});

