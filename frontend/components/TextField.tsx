import React from "react";
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { colors, spacing, typography } from "../theme";

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  containerStyle,
  accessibilityLabel,
  accessibilityHint,
  ...textInputProps
}: TextFieldProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={styles.label}
          accessibilityRole="text"
          accessibilityLabel={label}
        >
          {label}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          hasError && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        accessibilityLabel={accessibilityLabel || label || placeholder}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ invalid: hasError }}
        {...textInputProps}
      />

      {error && (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.l,
  },
  label: {
    marginBottom: spacing.xs,
    fontSize: typography.label,
    fontWeight: "500",
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.m,
    fontSize: typography.input,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  error: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: typography.error,
  },
});
