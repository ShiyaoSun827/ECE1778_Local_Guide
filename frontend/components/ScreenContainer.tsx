import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ViewStyle,
  StatusBar,
} from "react-native";
import { colors, spacing } from "../theme";

export interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeArea?: boolean;
  statusBarStyle?: "default" | "light-content" | "dark-content";
}

export default function ScreenContainer({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeArea = true,
  statusBarStyle = "default",
}: ScreenContainerProps) {
  const content = scrollable ? (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, styles.contentContainer, style]}>
      {children}
    </View>
  );

  if (safeArea) {
    return (
      <>
        <StatusBar barStyle={statusBarStyle} />
        <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle={statusBarStyle} />
      {content}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.m,
  },
});

