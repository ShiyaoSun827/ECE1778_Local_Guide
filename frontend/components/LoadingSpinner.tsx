import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "../theme";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "large",
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View style={containerStyle} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.m,
    fontSize: typography.text,
    color: colors.textSecondary,
  },
});

