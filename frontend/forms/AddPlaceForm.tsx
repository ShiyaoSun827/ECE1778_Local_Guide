import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import TextField from "../components/TextField";
import Button from "../components/Button";
import PhotoPicker from "../components/PhotoPicker";
import { validation } from "../theme/validation";
import { spacing } from "../theme";

export interface AddPlaceFormValues {
  title: string;
  address?: string;
  description?: string;
  photo: string | null;
  latitude?: number;
  longitude?: number;
}

export interface AddPlaceFormProps {
  onSubmit: (data: AddPlaceFormValues) => void | Promise<void>;
  initialValues?: Partial<AddPlaceFormValues>;
  submitButtonText?: string;
}

export default function AddPlaceForm({
  onSubmit,
  initialValues,
  submitButtonText = "Add Place",
}: AddPlaceFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddPlaceFormValues>({
    defaultValues: {
      title: "",
      address: "",
      description: "",
      photo: null,
      latitude: undefined,
      longitude: undefined,
      ...initialValues,
    },
  });

  const handleFormSubmit = async (data: AddPlaceFormValues) => {
    try {
      await onSubmit(data);
      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
      // Error handling is left to parent component
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="title"
        rules={{
          required: validation.required,
          minLength: {
            value: 2,
            message: validation.minLength(2),
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Title *"
            value={value}
            onChangeText={onChange}
            placeholder="Enter place name"
            error={errors.title?.message}
            accessibilityLabel="Place title"
            accessibilityHint="Enter the name of the place"
          />
        )}
      />

      <Controller
        control={control}
        name="address"
        rules={{
          minLength: {
            value: 5,
            message: validation.minLength(5),
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Address"
            value={value || ""}
            onChangeText={onChange}
            placeholder="Enter address (optional)"
            error={errors.address?.message}
            accessibilityLabel="Place address"
            accessibilityHint="Enter the address of the place"
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        rules={{
          maxLength: {
            value: 500,
            message: validation.maxLength(500),
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Description"
            value={value || ""}
            onChangeText={onChange}
            placeholder="Add a description (optional)"
            multiline
            numberOfLines={4}
            error={errors.description?.message}
            accessibilityLabel="Place description"
            accessibilityHint="Enter a description for this place"
          />
        )}
      />

      <Controller
        control={control}
        name="photo"
        render={({ field: { value, onChange } }) => (
          <PhotoPicker
            value={value}
            onChange={onChange}
            label="Photo"
            accessibilityLabel="Select or take a photo for this place"
          />
        )}
      />

      <Button
        title={submitButtonText}
        onPress={handleSubmit(handleFormSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submitButton}
        accessibilityLabel={submitButtonText}
        accessibilityHint="Submit the form to add this place"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.m,
    paddingBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.m,
  },
});
