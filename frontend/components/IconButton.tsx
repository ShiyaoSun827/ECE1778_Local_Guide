import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  style,
  size = 24,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { width: size + spacing.md, height: size + spacing.md }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { fontSize: size }]}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: colors.text,
  },
});

