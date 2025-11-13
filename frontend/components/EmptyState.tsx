import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../theme";

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: ReactNode;
  accessibilityLabel?: string;
}

export default function EmptyState({
  icon = "document-outline",
  title,
  message,
  action,
  accessibilityLabel,
}: EmptyStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || title}
    >
      <Ionicons name={icon} size={64} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    minHeight: 200,
  },
  title: {
    marginTop: spacing.m,
    fontSize: typography.title,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  message: {
    marginTop: spacing.s,
    fontSize: typography.text,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
  actionContainer: {
    marginTop: spacing.l,
  },
});

