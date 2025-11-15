import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { WeatherData } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
  error?: string | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error || 'Weather data unavailable'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.temperature}>{weather.temperature}°C</Text>
      <Text style={styles.condition}>{weather.condition}</Text>
      <Text style={styles.description}>{weather.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  temperature: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  condition: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});

