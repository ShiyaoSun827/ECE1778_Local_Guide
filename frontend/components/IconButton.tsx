import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

export default function IconButton({
  icon,
  onPress,
  size = 24,
  color = colors.text,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={size} color={disabled ? colors.textTertiary : color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.s,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
    backgroundColor: colors.backgroundSecondary,
  },
  disabled: {
    opacity: 0.4,
  },
});

