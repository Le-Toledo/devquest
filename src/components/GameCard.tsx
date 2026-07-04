import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { animations, radius, shadows, spacing } from '../theme';

export function GameCard({ children, style, accessibilityLabel }: { children: ReactNode; style?: ViewStyle; accessibilityLabel?: string }) {
  const { colors } = useSettings();
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(animations.entranceOffset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: animations.normal, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: animations.normal, useNativeDriver: true })
    ]).start();
  }, [fade, translateY]);

  return (
    <Animated.View
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, shadows.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: fade, transform: [{ translateY }] }, style]}
    >
      <View pointerEvents="none" style={[styles.highlight, { backgroundColor: colors.glow }]} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden'
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2
  }
});
