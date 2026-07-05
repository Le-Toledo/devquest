import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useSettings } from '@hooks';
import { animations, radius, shadows, spacing } from '@theme';

export function AppCard({ children, style, animated = true }: { children: ReactNode; style?: ViewStyle; animated?: boolean }) {
  const { colors } = useSettings();
  const fade = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? animations.entranceOffset : 0)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: animations.normal, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: animations.normal, useNativeDriver: true })
    ]).start();
  }, [animated, fade, translateY]);

  return <Animated.View style={[styles.card, shadows.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: fade, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg
  }
});
