import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Button } from './Button';

interface PhotoPickerProps {
  imageUri?: string;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRemove?: () => void;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  imageUri,
  onPickImage,
  onTakePhoto,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {onRemove && (
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}
      <View style={styles.buttons}>
        <Button
          title="Pick from Gallery"
          onPress={onPickImage}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Take Photo"
          onPress={onTakePhoto}
          variant="outline"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  removeText: {
    ...typography.caption,
    color: colors.surface,
  },
  placeholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

